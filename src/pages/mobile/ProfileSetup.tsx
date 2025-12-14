import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, User, AtSign, FileText, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ProfileSetup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName || null,
          username: username || null,
          bio: bio || null,
          avatar_url: avatarUrl || null,
        })
        .eq('id', user.id); // Use 'id' - in this schema, id IS the user_id

      if (error) throw error;

      toast({
        title: 'Profile created!',
        description: 'Your profile has been set up successfully.',
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Add a profile photo</h2>
              <p className="text-muted-foreground">Help others recognize you in the community</p>
            </div>

            {/* Avatar Upload */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-4 border-primary/20">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                <button 
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Avatar URL Input (placeholder for file upload) */}
            <div className="space-y-2">
              <Input
                placeholder="Or paste an image URL"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="h-12 bg-secondary/50 border-border rounded-xl"
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">What should we call you?</h2>
              <p className="text-muted-foreground">Choose a display name and username</p>
            </div>

            <div className="space-y-4">
              {/* Display Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="e.g., John Collector"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-11 h-12 bg-secondary/50 border-border rounded-xl"
                    maxLength={50}
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Username</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="e.g., johncollector"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="pl-11 h-12 bg-secondary/50 border-border rounded-xl"
                    maxLength={30}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Letters, numbers, and underscores only</p>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Tell us about yourself</h2>
              <p className="text-muted-foreground">Share your collecting interests</p>
            </div>

            <div className="space-y-4">
              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Bio</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Textarea
                    placeholder="I collect ancient coins from the Mughal era..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="pl-11 pt-3 min-h-[120px] bg-secondary/50 border-border rounded-xl resize-none"
                    maxLength={200}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{bio.length}/200</p>
              </div>

              {/* Interest Tags (visual only) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {['Ancient Coins', 'Mughal Era', 'British India', 'Modern Coins', 'Gold Coins', 'Silver Coins'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="px-3 py-1.5 rounded-full text-sm bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Skip
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 w-8 rounded-full transition-colors ${
                  i < step ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">{step}/{totalSteps}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4">
        {renderStep()}
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-border bg-background">
        <div className="flex gap-3">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12 rounded-xl"
            >
              Back
            </Button>
          )}
          
          {step < totalSteps ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-emerald-light text-primary-foreground"
            >
              Continue
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleComplete}
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-emerald-light text-primary-foreground"
            >
              {isSubmitting ? 'Setting up...' : 'Complete Setup'}
              <Check className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
