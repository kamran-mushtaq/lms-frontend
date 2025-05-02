"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
// Import other necessary UI components if available and appropriate (e.g., for Date, Numeric, Dropdown)
// For simplicity, using basic Input and Select for now, with TODOs for refinement.

const ProfileCompletionPage = () => {
  const router = useRouter();
  const { user, checkAptitudeTestStatus } = useAuth();
  const [formData, setFormData] = useState({
    // Registration Fields (using assumed lowercase keys)
    // NOTE: These keys are assumed based on the image and MongoDB convention.
    // They might need adjustment if the actual keys in the backend profile data are different.
    student_name: '', // Text
    'sf_#': '', // Numeric - Assuming sf_# - Corrected key format
    academic: '', // Help - Using text input for now
    b_form: '', // Numeric
    birth_date: '', // Date
    gender: '', // Dropdown Selection
    address: '', // Text
    city: '', // Text
    country: '', // Text
    phone: '', // Numeric - Student's phone
    father_name: '', // Text
    father_cnic: '', // Numeric
    'cell_#': '', // Numeric - Student's Cell # - Assuming cell_# - Corrected key format
    mother_name: '', // Text
    mother_cnic: '', // Numeric
    'mother_cell_#': '', // Numeric - Mother's Cell # - Assuming mother_cell_# - Corrected key format
    religion: '', // Text
    mother_tong: '', // Text
    cast_commu: '', // Dropdown Selection
    previous_edu: '', // Text
    membership: '', // Text
    student_its: '', // Text
    father_its: '', // Text
    mother_its: '', // Text
    reg_date: '', // Date
    '1st_preferen': '', // Help - Using text input for now
    '2nd_preferen': '', // Help - Using text input for now
    test_date: '', // Date
    test_time: '', // Time - Using text input for now
    primary_cont: '', // Dropdown Selection
    interview_da: '', // Date
    interview_tir: '', // Time - Using text input for now
    remarks: '', // Text
    form_fee: '', // Numeric
    segment: '', // Help - Using text input for now
    referral_nan: '', // Text
    referral_mol: '', // Numeric
    relation_wit: '', // Help - Using text input for now
    section_type: '', // Help - Using text input for now
  });
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://phpstack-732216-5200333.cloudwaysapps.com/api";

  // Fetch existing profile data when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      if (user?._id) {
        try {
          // Assuming an endpoint to get the current user's profile data
          // This might need adjustment based on actual backend implementation
          const response = await apiClient.get(`/profiles/user/${user._id}`); // Assuming GET /profiles/user/:userId endpoint
          const profileData = response.data?.data || [];
          const initialFormData: any = {};
          profileData.forEach((item: any) => {
            // Only populate fields that exist in our formData state
            if (formData.hasOwnProperty(item.key)) {
              initialFormData[item.key as keyof typeof formData] = item.value;
            }
          });
          setFormData(prev => ({ ...prev, ...initialFormData }));
        } catch (error) {
          console.error('Error fetching profile data:', error);
          toast.error('Failed to load existing profile data.');
        }
      }
    };
    fetchProfileData();
  }, [user]); // Fetch data when user object is available

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle Select component change
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement more robust form validation for all fields

    if (!user?._id) {
      toast.error("User not logged in.");
      setIsLoading(false);
      return;
    }

    try {
      // Using the confirmed API endpoint for updating profile: PATCH /profiles/:userId
      const response = await apiClient.patch(`${API_URL}/profiles/${user._id}`, {
        data: Object.keys(formData).map(key => ({
          key: key,
          value: formData[key as keyof typeof formData],
        })),
      });

      console.log('Profile update response:', response.data);
      toast.success('Profile updated successfully!');

      // After successful profile update, re-check aptitude test status and redirect
      if (user.type === "student") {
        const aptitudeStatus = await checkAptitudeTestStatus(user._id);
        if (aptitudeStatus?.attempted && aptitudeStatus?.passed) {
          router.push("/student/dashboard");
        } else {
          router.push("/aptitude-test");
        }
      } else {
         // Redirect non-student users to their dashboard or a default page
         router.push(`/${user?.type}/dashboard` || "/");
      }


    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render null or a loading indicator if user is not available yet
  if (!user) {
    return <div>Loading user data...</div>; // Or a spinner component
  }


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Registration Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="student_name">Student Name</Label>
            <Input type="text" name="student_name" id="student_name" value={formData.student_name} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="sf_#">S.F #</Label>
            <Input type="text" name="sf_#" id="sf_#" value={formData['sf_#']} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="academic">Academic</Label>
            {/* TODO: Implement appropriate input for 'Help' type */}
            <Input type="text" name="academic" id="academic" value={formData.academic} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="b_form">B-Form</Label>
            <Input type="text" name="b_form" id="b_form" value={formData.b_form} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="birth_date">Birth Date</Label>
            <Input type="date" name="birth_date" id="birth_date" value={formData.birth_date} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            {/* TODO: Define actual options for Gender dropdown */}
            <Select onValueChange={(value) => handleSelectChange('gender', value)} value={formData.gender} >
              <SelectTrigger>
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input type="text" name="address" id="address" value={formData.address} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input type="text" name="city" id="city" value={formData.city} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input type="text" name="country" id="country" value={formData.country} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input type="text" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="father_name">Father's Name</Label>
            <Input type="text" name="father_name" id="father_name" value={formData.father_name} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="father_cnic">Father's CNIC</Label>
            <Input type="text" name="father_cnic" id="father_cnic" value={formData.father_cnic} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="cell_#">Student's Cell #</Label>
            <Input type="text" name="cell_#" id="cell_#" value={formData['cell_#']} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="mother_name">Mother's Name</Label>
            <Input type="text" name="mother_name" id="mother_name" value={formData.mother_name} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="mother_cnic">Mother's CNIC</Label>
            <Input type="text" name="mother_cnic" id="mother_cnic" value={formData.mother_cnic} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="mother_cell_#">Mother's Cell #</Label>
            <Input type="text" name="mother_cell_#" id="mother_cell_#" value={formData['mother_cell_#']} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="religion">Religion</Label>
            <Input type="text" name="religion" id="religion" value={formData.religion} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="mother_tong">Mother Tongue</Label>
            <Input type="text" name="mother_tong" id="mother_tong" value={formData.mother_tong} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="cast_commu">Cast Community</Label>
            {/* TODO: Define actual options for Cast Community dropdown */}
            <Select onValueChange={(value) => handleSelectChange('cast_commu', value)} value={formData.cast_commu} >
              <SelectTrigger>
                <SelectValue placeholder="Select Cast Community" />
              </SelectTrigger>
              <SelectContent>
                {/* Add SelectItem components for options */}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="previous_edu">Previous Education</Label>
            <Input type="text" name="previous_edu" id="previous_edu" value={formData.previous_edu} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="membership">Membership</Label>
            <Input type="text" name="membership" id="membership" value={formData.membership} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="student_its">Student ITS</Label>
            <Input type="text" name="student_its" id="student_its" value={formData.student_its} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="father_its">Father ITS</Label>
            <Input type="text" name="father_its" id="father_its" value={formData.father_its} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="mother_its">Mother ITS</Label>
            <Input type="text" name="mother_its" id="mother_its" value={formData.mother_its} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="reg_date">Registration Date</Label>
            <Input type="date" name="reg_date" id="reg_date" value={formData.reg_date} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="1st_preferen">1st Preference</Label>
            {/* TODO: Implement appropriate input for 'Help' type */}
            <Input type="text" name="1st_preferen" id="1st_preferen" value={formData['1st_preferen']} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="2nd_preferen">2nd Preference</Label>
            {/* TODO: Implement appropriate input for 'Help' type */}
            <Input type="text" name="2nd_preferen" id="2nd_preferen" value={formData['2nd_preferen']} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="test_date">Test Date</Label>
            <Input type="date" name="test_date" id="test_date" value={formData.test_date} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="test_time">Test Time</Label>
            {/* TODO: Implement appropriate input for 'Time' type */}
            <Input type="text" name="test_time" id="test_time" value={formData.test_time} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="primary_cont">Primary Contact</Label>
            {/* TODO: Define actual options for Primary Contact dropdown */}
            <Select onValueChange={(value) => handleSelectChange('primary_cont', value)} value={formData.primary_cont} >
              <SelectTrigger>
                <SelectValue placeholder="Select Primary Contact" />
              </SelectTrigger>
              <SelectContent>
                {/* Add SelectItem components for options */}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="interview_da">Interview Date</Label>
            <Input type="date" name="interview_da" id="interview_da" value={formData.interview_da} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="interview_tir">Interview Time</Label>
            {/* TODO: Implement appropriate input for 'Time' type */}
            <Input type="text" name="interview_tir" id="interview_tir" value={formData.interview_tir} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Input type="text" name="remarks" id="remarks" value={formData.remarks} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="form_fee">Form Fee</Label>
            <Input type="text" name="form_fee" id="form_fee" value={formData.form_fee} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="segment">Segment</Label>
            {/* TODO: Implement appropriate input for 'Help' type */}
            <Input type="text" name="segment" id="segment" value={formData.segment} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="referral_nan">Referral Name</Label>
            <Input type="text" name="referral_nan" id="referral_nan" value={formData.referral_nan} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="referral_mol">Referral Mobile</Label>
            <Input type="text" name="referral_mol" id="referral_mol" value={formData.referral_mol} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="relation_wit">Relation With</Label>
            {/* TODO: Implement appropriate input for 'Help' type */}
            <Input type="text" name="relation_wit" id="relation_wit" value={formData.relation_wit} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="section_type">Section Type</Label>
            {/* TODO: Implement appropriate input for 'Help' type */}
            <Input type="text" name="section_type" id="section_type" value={formData.section_type} onChange={handleInputChange} required />
          </div>
        </div>


        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Complete Profile'}
        </Button>
      </form>
    </div>
  );
};

export default ProfileCompletionPage;