import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Calendar, Clock, DollarSign, Download, FileText,
  Image as ImageIcon, User, BadgeCheck, Loader2, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PremiumNavBar } from "@/components/mobile/PremiumNavBar";
import { ProfileView } from "@/components/chat/ProfileView";
import { toast } from "sonner";

export default function SessionDetailsView() {
  const { id: requestId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<any>(null);
  const [expert, setExpert] = useState<any>(null);
  const [document, setDocument] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showDocument, setShowDocument] = useState(false);

  useEffect(() => {
    if (requestId && user) {
      fetchSessionDetails();
    }
  }, [requestId, user]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);

      // Fetch auth request
      const { data: requestData, error: requestError } = await supabase
        .from('auth_requests')
        .select('*')
        .eq('id', requestId)
        .eq('user_id', user.id)
        .single();

      if (requestError || !requestData) {
        toast.error("Session not found");
        navigate('/profile');
        return;
      }

      setRequest(requestData);

      // Fetch expert profile
      if (requestData.assigned_expert_id) {
        const { data: expertData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', requestData.assigned_expert_id)
          .maybeSingle();

        if (!expertData) {
          const { data: expertById } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', requestData.assigned_expert_id)
            .maybeSingle();
          if (expertById) setExpert(expertById);
        } else {
          setExpert(expertData);
        }
      }

      // Fetch session document
      const { data: docData } = await supabase
        .from('session_documents')
        .select('*')
        .eq('auth_request_id', requestId)
        .maybeSingle();

      if (docData) {
        setDocument(docData);
      }
    } catch (error) {
      console.error("Error fetching session details:", error);
      toast.error("Failed to load session details");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async () => {
    if (!document) return;

    try {
      if (document.document_url && document.document_url.startsWith('http')) {
        // Direct URL - download it
        const link = document.createElement('a');
        link.href = document.document_url;
        link.download = `session_${requestId}_document.txt`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Document downloaded");
      } else if (document.document_content) {
        // Generate from content
        const content = document.document_content;
        let text = '';
        
        if (content.messages && Array.isArray(content.messages)) {
          text = content.messages.map((msg: any) => 
            `[${msg.timestamp}] ${msg.sender}:\n${msg.content}\n`
          ).join('\n---\n\n');
        } else {
          text = JSON.stringify(content, null, 2);
        }

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `session_${requestId}_document.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Document downloaded");
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    }
  };

  const handleViewDocument = () => {
    setShowDocument(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Session not found</p>
          <Button onClick={() => navigate('/profile')}>Back to Profile</Button>
        </div>
      </div>
    );
  }

  const sessionStartTime = request.session_started_at 
    ? new Date(request.session_started_at)
    : new Date(request.created_at);
  
  const sessionEndTime = request.updated_at 
    ? new Date(request.updated_at)
    : null;

  const duration = sessionEndTime 
    ? Math.round((sessionEndTime.getTime() - sessionStartTime.getTime()) / 1000 / 60)
    : null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-gold/20 p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="text-gold"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-gold to-yellow-600 bg-clip-text text-transparent">
            Session Details
          </h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Session Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-card via-[hsl(var(--blue-light))] to-card border-2 border-gold/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Session Information</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              request.status === 'completed' ? 'bg-green-500/20 text-green-500' :
              request.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
              'bg-yellow-500/20 text-yellow-500'
            }`}>
              {request.status}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gold" />
              <div>
                <p className="text-sm text-muted-foreground">Session Date</p>
                <p className="font-medium">{sessionStartTime.toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gold" />
              <div>
                <p className="text-sm text-muted-foreground">Session Time</p>
                <p className="font-medium">
                  {sessionStartTime.toLocaleTimeString()} 
                  {sessionEndTime && ` - ${sessionEndTime.toLocaleTimeString()}`}
                </p>
                {duration && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Duration: {duration} minutes
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gold" />
              <div>
                <p className="text-sm text-muted-foreground">Amount Spent</p>
                <p className="font-bold text-gold">₹{Number(request.amount_paid || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Expert Info Card */}
        {expert && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-card via-[hsl(var(--blue-light))] to-card border-2 border-gold/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Expert Details</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfile(true)}
                className="border-gold/30 text-gold hover:bg-gold/10"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={expert.avatar_url || "https://i.pravatar.cc/150?img=12"}
                alt={expert.display_name || "Expert"}
                className="w-16 h-16 rounded-full object-cover border-2 border-gold/30"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{expert.display_name || expert.username || "Expert"}</h3>
                  <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                </div>
                {expert.bio && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{expert.bio}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Uploaded Images */}
        {(request.front_image_url || request.back_image_url) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-card via-[hsl(var(--blue-light))] to-card border-2 border-gold/20"
          >
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gold" />
              Uploaded Images
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {request.front_image_url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Front</p>
                  <img
                    src={request.front_image_url}
                    alt="Front"
                    className="w-full rounded-xl border-2 border-gold/20"
                  />
                </div>
              )}
              {request.back_image_url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Back</p>
                  <img
                    src={request.back_image_url}
                    alt="Back"
                    className="w-full rounded-xl border-2 border-gold/20"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Verdict */}
        {request.authenticity_verdict && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-card via-[hsl(var(--blue-light))] to-card border-2 border-gold/20"
          >
            <h2 className="text-lg font-bold text-foreground mb-2">Expert Verdict</h2>
            <p className={`font-semibold mb-2 ${
              request.authenticity_verdict === 'authentic' ? 'text-green-500' :
              request.authenticity_verdict === 'fake' ? 'text-red-500' :
              'text-yellow-500'
            }`}>
              {request.authenticity_verdict.toUpperCase()}
            </p>
            {request.expert_notes && (
              <p className="text-sm text-muted-foreground">{request.expert_notes}</p>
            )}
          </motion.div>
        )}

        {/* Document Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-card via-[hsl(var(--blue-light))] to-card border-2 border-gold/20"
        >
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold" />
            Session Document
          </h2>
          
          {document ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Document generated on {new Date(document.created_at).toLocaleString()}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleViewDocument}
                  variant="outline"
                  className="flex-1 border-gold/30 text-gold hover:bg-gold/10"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Document
                </Button>
                <Button
                  onClick={handleDownloadDocument}
                  variant="outline"
                  className="flex-1 border-gold/30 text-gold hover:bg-gold/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No document available for this session.
            </p>
          )}
        </motion.div>
      </div>

      {/* Profile Modal */}
      {showProfile && expert && (
        <ProfileView
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          profile={expert}
        />
      )}

      {/* Document Modal */}
      {showDocument && document && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto border-2 border-gold/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Session Document</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDocument(false)}
              >
                ×
              </Button>
            </div>
            <div className="space-y-4 whitespace-pre-wrap text-sm font-mono">
              {document.document_content?.messages ? (
                document.document_content.messages.map((msg: any, idx: number) => (
                  <div key={idx} className="border-b border-border/50 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gold">{msg.sender}</span>
                      <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                    </div>
                    <p className="text-foreground">{msg.content}</p>
                  </div>
                ))
              ) : (
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(document.document_content, null, 2)}
                </pre>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <PremiumNavBar />
    </div>
  );
}
