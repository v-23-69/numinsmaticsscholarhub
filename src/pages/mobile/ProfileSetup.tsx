import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, User, AtSign, FileText, ChevronRight, Check, Phone, MapPin, Mail, Instagram, Facebook, Twitter, Linkedin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { uploadImage } from '@/utils/uploadUtils';

const ProfileSetup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  // Address fields
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  
  // Social media links
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalSteps = 4;

  // Load existing profile data for editing
  React.useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get email from user
        if (user.email) {
          setEmail(user.email);
        }

        // Fetch existing profile
        let { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error || !profile) {
          // Try with id field
          const result = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          profile = result.data;
        }

        if (profile) {
          // Pre-fill form with existing data
          setDisplayName(profile.display_name || '');
          setUsername(profile.username || '');
          setBio(profile.bio || '');
          setAvatarUrl(profile.avatar_url || '');
          setPhone(profile.phone || '');

          // Parse location if exists
          if (profile.location) {
            const locationParts = profile.location.split(', ');
            if (locationParts.length >= 4) {
              setAddressLine1(locationParts[0] || '');
              setAddressLine2(locationParts[1] || '');
              setCity(locationParts[2] || '');
              setState(locationParts[3] || '');
              setPostalCode(locationParts[4] || '');
              setCountry(locationParts[5] || 'India');
            }
          }

          // Parse social links
          if (profile.social_links) {
            const links = profile.social_links as any;
            setInstagram(links.instagram || '');
            setFacebook(links.facebook || '');
            setTwitter(links.twitter || '');
            setLinkedin(links.linkedin || '');
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleComplete = async () => {
    if (!user) return;
    
    // Validation
    if (!displayName.trim()) {
      toast({
        title: 'Required field',
        description: 'Please enter your full name',
        variant: 'destructive',
      });
      return;
    }

    if (!phone.trim()) {
      toast({
        title: 'Required field',
        description: 'Please enter your phone number',
        variant: 'destructive',
      });
      return;
    }

    if (!addressLine1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      toast({
        title: 'Required field',
        description: 'Please complete your address',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let finalAvatarUrl = avatarUrl;

      // Upload avatar if file selected
      if (avatarFile) {
        const uploadedUrl = await uploadImage(avatarFile, 'avatars', 'profiles');
        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl;
        }
      }

      // Update profile - build update object
      // Format address string for profiles.location
      const addressString = [
        addressLine1.trim(),
        addressLine2.trim(),
        city.trim(),
        state.trim(),
        postalCode.trim(),
        country
      ].filter(Boolean).join(', ');

      const profileUpdate: any = {
        display_name: displayName.trim(),
        username: username.trim() || null,
        bio: bio.trim() || null,
        avatar_url: finalAvatarUrl || null,
        location: addressString || null, // Add location to main update
      };

      // Try to add phone if column exists
      try {
        profileUpdate.phone = phone.trim();
      } catch (e) {
        // Phone column might not exist, will handle in update
      }

      // Add social media links as JSONB
      const socialLinks: any = {};
      if (instagram.trim()) socialLinks.instagram = instagram.trim();
      if (facebook.trim()) socialLinks.facebook = facebook.trim();
      if (twitter.trim()) socialLinks.twitter = twitter.trim();
      if (linkedin.trim()) socialLinks.linkedin = linkedin.trim();
      
      if (Object.keys(socialLinks).length > 0) {
        profileUpdate.social_links = socialLinks;
      }

      // Update profile - using user_id field based on schema
      let profileError: any = null;
      let updateSuccess = false;
      
      try {
        const result = await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('user_id', user.id);
        profileError = result.error;
        if (!profileError) {
          updateSuccess = true;
        }
      } catch (err: any) {
        // If phone or location column doesn't exist, remove it and try again
        if (err.code === '42703' || err.message?.includes('phone') || err.message?.includes('location') || err.message?.includes("Could not find the")) {
          const profileUpdateWithoutOptional = { ...profileUpdate };
          delete profileUpdateWithoutOptional.phone;
          // Don't delete location - it should exist, but handle gracefully
          if (err.message?.includes('location')) {
            delete profileUpdateWithoutOptional.location;
          }
          const result = await supabase
            .from('profiles')
            .update(profileUpdateWithoutOptional)
            .eq('user_id', user.id);
          profileError = result.error;
          if (!profileError) {
            updateSuccess = true;
          }
        } else {
          profileError = err;
        }
      }

      if (!updateSuccess && profileError) {
        // Try with id field if user_id doesn't work
        try {
          const result = await supabase
            .from('profiles')
            .update(profileUpdate)
            .eq('id', user.id);
          
          if (result.error) {
            // If still fails with phone or location, try without them
            if (result.error.code === '42703' || result.error.message?.includes('phone') || result.error.message?.includes('location')) {
              const profileUpdateWithoutOptional = { ...profileUpdate };
              delete profileUpdateWithoutOptional.phone;
              if (result.error.message?.includes('location')) {
                delete profileUpdateWithoutOptional.location;
              }
              const retryResult = await supabase
                .from('profiles')
                .update(profileUpdateWithoutOptional)
                .eq('id', user.id);
              if (retryResult.error) {
                console.error('Profile update error:', retryResult.error);
                throw retryResult.error;
              }
            } else {
              throw result.error;
            }
          } else {
            updateSuccess = true;
          }
        } catch (err: any) {
          console.error('Profile update failed:', err);
          // Don't throw - allow profile to be saved even if location fails
          // We'll save to shipping_addresses which is more reliable
        }
      }

      // If location update failed, try to update it separately
      if (!updateSuccess || !profileUpdate.location) {
        try {
          await supabase
            .from('profiles')
            .update({ location: addressString })
            .eq('user_id', user.id);
        } catch (locationErr: any) {
          // Try with id field
          try {
            await supabase
              .from('profiles')
              .update({ location: addressString })
              .eq('id', user.id);
          } catch (err2) {
            console.warn('Location column might not exist. Run migration: supabase/add_location_to_profiles.sql', err2);
          }
        }
      }

      // Location is now included in profileUpdate above, no need for separate update

      // Create shipping address
      const { error: addressError } = await supabase
        .from('shipping_addresses')
        .insert({
          user_id: user.id,
          full_name: displayName.trim(),
          address_line1: addressLine1.trim(),
          address_line2: addressLine2.trim() || null,
          city: city.trim(),
          state: state.trim(),
          postal_code: postalCode.trim(),
          country: country,
          phone_number: phone.trim(),
          is_default: true,
        });

      if (addressError) {
        console.warn('Error creating address (non-blocking):', addressError);
      }

      // Verify location was saved by checking the profile
      let locationSaved = false;
      try {
        const { data: verifyProfile } = await supabase
          .from('profiles')
          .select('location')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!verifyProfile) {
          // Try with id field
          const { data: verifyById } = await supabase
            .from('profiles')
            .select('location')
            .eq('id', user.id)
            .maybeSingle();
          locationSaved = verifyById?.location ? true : false;
        } else {
          locationSaved = verifyProfile.location ? true : false;
        }
      } catch (verifyErr) {
        console.warn('Could not verify location save:', verifyErr);
      }

      if (!locationSaved && addressString) {
        console.warn('Location was not saved. Attempting final save...');
        // Final attempt to save location
        try {
          await supabase
            .from('profiles')
            .update({ location: addressString })
            .eq('user_id', user.id);
        } catch (finalErr: any) {
          // Try with id field
          try {
            await supabase
              .from('profiles')
              .update({ location: addressString })
              .eq('id', user.id);
          } catch (err2) {
            console.error('Final location save failed. Please run migration: supabase/add_location_to_profiles.sql', err2);
            toast({
              title: 'Warning',
              description: 'Profile saved but address may not have been saved. Please check your profile.',
              variant: 'destructive',
            });
          }
        }
      }

      toast({
        title: displayName ? 'Profile updated!' : 'Profile created!',
        description: displayName ? 'Your profile has been updated successfully.' : 'Your profile has been set up successfully.',
      });
      
      // Set profile completion cache to true - profile is now complete
      if (typeof window !== 'undefined' && user?.id) {
        sessionStorage.setItem(`profile_complete_${user.id}`, 'true');
        // Also clear any stale cache entries
        sessionStorage.removeItem(`profile_complete_${user.id}_stale`);
      }
      
      // Small delay to ensure database write completes
      setTimeout(() => {
        navigate('/profile', { state: { from: '/profile/setup' } });
      }, 100);
    } catch (error: any) {
      console.error('Profile setup error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile. Please try again.',
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
                <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-4 border-primary/20 cursor-pointer hover:border-primary/40 transition-colors" onClick={handleAvatarClick}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                <button 
                  type="button"
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  onClick={handleAvatarClick}
                >
                  <Camera className="h-5 w-5" />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Tap the camera icon to upload a photo
            </p>
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
              <h2 className="text-2xl font-bold text-foreground mb-2">Personal Information</h2>
              <p className="text-muted-foreground">Tell us about yourself</p>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="e.g., John Collector"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-11 h-12 bg-secondary/50 border-border rounded-xl"
                    maxLength={50}
                    required
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

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-secondary/50 border-border rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-11 h-12 bg-secondary/50 border-border rounded-xl"
                    maxLength={15}
                    required
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Bio</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Textarea
                    placeholder="I collect ancient coins from the Mughal era..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="pl-11 pt-3 min-h-[100px] bg-secondary/50 border-border rounded-xl resize-none"
                    maxLength={200}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{bio.length}/200</p>
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
              <h2 className="text-2xl font-bold text-foreground mb-2">Address</h2>
              <p className="text-muted-foreground">Where should we send your orders?</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Address Line 1 *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Street address, P.O. box"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="pl-11 h-12 bg-secondary/50 border-border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Address Line 2</label>
                <Input
                  placeholder="Apartment, suite, unit, building, floor, etc."
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="h-12 bg-secondary/50 border-border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">City *</label>
                  <Input
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-12 bg-secondary/50 border-border rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">State *</label>
                  <Input
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="h-12 bg-secondary/50 border-border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Postal Code *</label>
                  <Input
                    placeholder="PIN Code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="h-12 bg-secondary/50 border-border rounded-xl"
                    maxLength={10}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Country *</label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="h-12 bg-secondary/50 border-border rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Social Media (Optional)</h2>
              <p className="text-muted-foreground">Connect your social profiles</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </label>
                <Input
                  placeholder="@username"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="h-12 bg-secondary/50 border-border rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  Facebook
                </label>
                <Input
                  placeholder="facebook.com/username"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="h-12 bg-secondary/50 border-border rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Twitter className="w-4 h-4" />
                  Twitter
                </label>
                <Input
                  placeholder="@username"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="h-12 bg-secondary/50 border-border rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </label>
                <Input
                  placeholder="linkedin.com/in/username"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="h-12 bg-secondary/50 border-border rounded-xl"
                />
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              You can skip this step and add these later
            </p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => navigate('/profile')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {displayName ? 'Cancel' : 'Skip'}
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
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
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
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Complete Setup
                  <Check className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
