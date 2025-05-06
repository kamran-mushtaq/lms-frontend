// src/app/(student)/profile/types.ts
// Updated type definitions for student profile based on requirements

// Define the academic entry type
export interface AcademicEntry {
  institutionName: string;
  location: string;
  certification: string;
  qualificationType: string;
  qualification: string;
  year: string;
}

// Define the guardian type
export interface Guardian {
  name: string;
  relation: string;
  cnicNumber?: string;
  phoneNo?: string;
  cellNo: string;
  email?: string;
  designation?: string;
  company?: string;
  officeAddress?: string;
  officePhone?: string;
  monthlyIncome?: string;
  vaccinated?: boolean;
  taxFiler?: boolean;
  itsNumber?: string; // For Father/Mother ITS
}

// Define the sibling type
export interface Sibling {
  name: string;
  gender: string;
  birthDate: string;
  schoolName?: string;
}

// Define the contact person type
export interface ContactPerson {
  name: string;
  cellNo: string;
  email?: string;
  designation?: string;
  company?: string;
  relation: string;
  monthlyIncome?: string;
}

// Define the referral type
export interface Referral {
  name: string;
  mobileNumber: string;
  relation: string;
}

// Define the custom detail entry type
export interface CustomDetailEntry {
  type: string;
  description: string;
  reference?: string;
}

// Updated StudentProfile type with all fields based on requirements
export interface StudentProfile {
  // Student Information
  name: string;
  sfNumber?: string;
  bFormNumber?: string;
  birthDate: string;
  gender: string;
  address1: string;
  address2?: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  religion?: string;
  motherTongue?: string;
  castCommunity?: string;
  nationality?: string;
  bloodGroup?: string;
  height?: string;
  weight?: string;
  maritalStatus?: string;
  vaccinated?: boolean;
  photoUrl?: string;

  // Family Information
  fatherName?: string;
  fatherCnic?: string;
  fatherCellNo?: string;
  fatherIts?: string;
  motherName?: string;
  motherCnic?: string;
  motherIts?: string;
  guardian?: string;
  siblings?: Sibling[];

  // Academic Details
  previousEducation?: string;
  membershipNumber?: string;
  studentIts?: string;
  registrationDate?: string;
  firstPreferenceClass?: string;
  secondPreferenceClass?: string;
  currentSemester: string;
  admissionDate: string;
  degreeTitle: string;
  batch: string;
  gradePolicy: string;
  graduateYear?: string;
  preQualification?: string;
  transcriptFootNote?: string;
  academicInformation?: AcademicEntry[];

  // Administrative & Financial
  regNumber: string;
  formFee?: string;
  segment?: string;
  sectionType?: string;
  chartOfAccount?: string;
  monthlyOrBi: string;
  securityDepositAccount?: string;
  temporary?: boolean;
  advanceAccount?: string;
  status: string;
  leftReason?: string;
  leaveDate?: string;
  activationDate?: string;
  leavingSem?: string;

  // Contact & Communication
  personalEmail?: string;
  smsMobile1?: string;
  smsMobile2?: string;
  landMarks?: string;
  area?: string;
  officeAddress?: string;
  officePhoneNo?: string;

  // References & Emergency Contacts
  referral?: Referral;
  contactPersons?: ContactPerson[];

  // Additional Metadata
  otherInfo?: string;
  standardEduFrom?: string;
  transferTo?: string;
  additionalDetails?: CustomDetailEntry[];

  // For UI purposes
  activities?: Array<{
    title: string;
    description: string;
    date: string;
  }>;
}

// Types for form values
export interface PersonalDetailsFormValues {
  nationality?: string;
  religion?: string;
  motherTongue?: string;
  bloodGroup?: string;
  height?: string;
  weight?: string;
  maritalStatus?: string;
  castCommunity?: string;
  vaccinated?: boolean;
}
