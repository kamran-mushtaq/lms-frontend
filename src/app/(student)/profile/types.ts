// Updated StudentProfile type with GitHub fields
export interface StudentProfile {
  // General Info
  regNumber: string;
  name: string;
  oldGr?: string;
  photoUrl?: string;
  
  // GitHub Integration
  githubUsername?: string;
  githubAvatarUrl?: string;

  // Contact Info
  address1: string;
  address2?: string;
  landMarks?: string;
  area?: string;
  phone: string;
  cell?: string;
  country: string;
  city: string;
  smsMobile1?: string;
  smsMobile2?: string;
  personalEmail?: string;
  email: string;

  // Personal Info
  birthPlace?: string;
  birthDate: string;
  gender: string;
  cnicNumber: string;
  nationality?: string;
  religion?: string;
  firstLanguage?: string;
  bloodGroup?: string;
  height?: string;
  weight?: string;
  maritalStatus?: string;
  transcriptFootNote?: string;
  portalLogin?: string;
  portalPassword?: string;

  // Academic Info
  currentSemester: string;
  admissionDate: string;
  batch: string;
  activationDate?: string;
  leavingSem?: string;
  leaveDate?: string;
  status: string;
  leftReason?: string;
  degreeTitle: string;
  chartOfAccount?: string;
  monthlyOrBi: string;
  gradePolicy: string;
  graduateYear?: string;
  specialization?: string;
  section?: string;
  totalCreditHours?: number;

  // Guardian & Contact Persons
  guardians?: Array<{
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
  }>;

  // Siblings
  siblings?: Array<{
    name: string;
    gender: string;
    birthDate: string;
    schoolName?: string;
  }>;

  // Academic History
  academicInformation?: Array<{
    institutionName: string;
    location: string;
    certification: string;
    qualificationType: string;
    qualification: string;
    year: string;
  }>;

  // Fee Setup
  feeSetup?: {
    semesterId: string;
    segment?: string;
    section?: string;
    totalCreditHours?: number;
    specialization?: string;
    subject?: string;
    feeGroupId: string;
    fees?: Array<{
      type: string;
      amount: string;
      dueDate: string;
      status: string;
    }>;
  };

  // Discounts
  discounts?: Array<{
    taxOtherId: string;
    feeId: string;
    type: string;
    percentage: number;
    amount: number;
    calculateOn: string;
    startValidDate: string;
    endValidDate: string;
    reference?: string;
  }>;

  // Documents
  documents?: Array<{
    name: string;
    type: string;
    uploadDate: string;
    url: string;
  }>;

  // Additional Details
  additionalDetails?: Array<{
    type: string;
    description: string;
  }>;

  // Activities
  activities?: Array<{
    title: string;
    description: string;
    date: string;
  }>;
}