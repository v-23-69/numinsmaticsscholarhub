/**
 * Document Generator for Expert Sessions
 * Generates PDF documents from chat sessions
 */

import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  sentAt: number;
  senderName?: string;
}

export interface SessionDocument {
  requestId: string;
  userId: string;
  expertId: string;
  expertName: string;
  userName: string;
  messages: ChatMessage[];
  createdAt: Date;
  status: string;
  verdict?: string;
  notes?: string;
}

/**
 * Generate a text document from session messages
 */
export async function generateSessionDocument(
  requestId: string,
  userId: string,
  expertId: string,
  messages: ChatMessage[],
  expertName: string,
  userName: string
): Promise<string> {
  const { data: request } = await supabase
    .from('auth_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  const documentContent = {
    title: `Expert Authentication Session - ${requestId.slice(0, 8)}`,
    sessionInfo: {
      requestId,
      date: new Date().toLocaleString(),
      user: userName,
      expert: expertName,
      status: request?.status || 'completed',
      verdict: request?.authenticity_verdict || request?.expert_verdict || 'N/A',
      notes: request?.expert_notes || 'No additional notes',
    },
    messages: messages.map(msg => ({
      sender: msg.senderName || (msg.senderId === userId ? userName : expertName),
      timestamp: new Date(msg.sentAt).toLocaleString(),
      content: msg.text,
    })),
  };

  // Generate formatted text document
  let documentText = `
═══════════════════════════════════════════════════════════
  EXPERT AUTHENTICATION SESSION DOCUMENT
═══════════════════════════════════════════════════════════

Session ID: ${requestId}
Date: ${documentContent.sessionInfo.date}
User: ${documentContent.sessionInfo.user}
Expert: ${documentContent.sessionInfo.expert}
Status: ${documentContent.sessionInfo.status}
Verdict: ${documentContent.sessionInfo.verdict}

═══════════════════════════════════════════════════════════
  SESSION TRANSCRIPT
═══════════════════════════════════════════════════════════

`;

  documentContent.messages.forEach((msg, index) => {
    documentText += `\n[${msg.timestamp}] ${msg.sender}:\n${msg.content}\n`;
    if (index < documentContent.messages.length - 1) {
      documentText += '\n---\n';
    }
  });

  documentText += `\n\n═══════════════════════════════════════════════════════════
  EXPERT ASSESSMENT
═══════════════════════════════════════════════════════════

${documentContent.sessionInfo.notes}

═══════════════════════════════════════════════════════════
Document Generated: ${new Date().toLocaleString()}
═══════════════════════════════════════════════════════════
`;

  return documentText;
}

/**
 * Save session document to database and storage
 */
export async function saveSessionDocument(
  requestId: string,
  userId: string,
  expertId: string,
  documentText: string,
  documentContent: any
): Promise<string | null> {
  try {
    // Create a blob from the text document
    const blob = new Blob([documentText], { type: 'text/plain' });
    const fileName = `session_${requestId}_${Date.now()}.txt`;
    
    // Upload to Supabase Storage
    let documentUrl = null;
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`sessions/${userId}/${fileName}`, blob, {
          contentType: 'text/plain',
          upsert: false,
        });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(`sessions/${userId}/${fileName}`);
        documentUrl = urlData.publicUrl;
      } else {
        console.warn('Storage upload failed (non-blocking):', uploadError);
        // Create a data URL as fallback
        const reader = new FileReader();
        documentUrl = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
    } catch (storageError) {
      console.warn('Storage bucket might not exist (non-blocking):', storageError);
      // Create a data URL as fallback
      const reader = new FileReader();
      documentUrl = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    }

    // Save document metadata to database - use upsert to avoid duplicates
    const { error: dbError } = await supabase
      .from('session_documents')
      .upsert({
        auth_request_id: requestId,
        user_id: userId,
        expert_id: expertId,
        document_url: documentUrl,
        document_content: documentContent,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'auth_request_id',
        ignoreDuplicates: false
      });

    if (dbError) {
      console.error('Error saving document metadata:', dbError);
      // If RLS error, try to insert without expert_id (might be permission issue)
      if (dbError.code === '42501' || dbError.message?.includes('permission denied')) {
        try {
          const { error: retryError } = await supabase
            .from('session_documents')
            .upsert({
              auth_request_id: requestId,
              user_id: userId,
              document_url: documentUrl,
              document_content: documentContent,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'auth_request_id',
              ignoreDuplicates: false
            });
          if (retryError) {
            console.error('Retry insert also failed:', retryError);
          }
        } catch (retryErr) {
          console.error('Retry insert error:', retryErr);
        }
      }
    }

    return documentUrl;
  } catch (error) {
    console.error('Error saving session document:', error);
    return null;
  }
}

/**
 * Generate and save session document
 */
export async function generateAndSaveSessionDocument(
  requestId: string,
  userId: string,
  expertId: string,
  messages: ChatMessage[],
  expertName: string,
  userName: string
): Promise<string | null> {
  try {
    const documentText = await generateSessionDocument(
      requestId,
      userId,
      expertId,
      messages,
      expertName,
      userName
    );

    const documentContent = {
      messages: messages.map(msg => ({
        sender: msg.senderName || (msg.senderId === userId ? userName : expertName),
        timestamp: new Date(msg.sentAt).toLocaleString(),
        content: msg.text,
      })),
    };

    return await saveSessionDocument(
      requestId,
      userId,
      expertId,
      documentText,
      documentContent
    );
  } catch (error) {
    console.error('Error generating session document:', error);
    return null;
  }
}
