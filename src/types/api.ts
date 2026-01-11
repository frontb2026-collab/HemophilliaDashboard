export interface Company {
  id: number;
  name: string;
  country: string;
  quantity: number;
}

export interface CompanyRequest {
  name: string;
  country: string;
  quantity: number;
}

export interface Factor {
  id: number;
  name: string;
  lotNo: string;
  quantity: number;
  expiryDate: string;
  mg: number;
  drugType: string;
  supplierName: string;
  companyName: string;
}

export interface FactorRequest {
  name: string;
  lotNo: string;
  quantity: number;
  expiryDate: string;
  mg: number;
  drugType: string;
  supplierName: string;
  companyName: string;
}

export interface Patient {
  id: number;
  fullName: string;
  nationalIdNumber: string;
  dateOfBirth: string;
  gender?: string;
  homeState?: string;
  homeCityOrTown?: string;
  homeLocality?: string;
  residenceType?: 'InsideSudan' | 'OutsideSudan';
  country?: string;
  cityOrTown?: string;
  locality?: string;
  state?: string;
  maritalStatus?: string;
  occupation?: string;
  contactNumber?: string;
  contactNumber1?: string;
  contactNumber2?: string;
  vitalStatus?: 'Alive' | 'Died' | 'Unknown';
  hemophiliaCenterId?: string;
  diagnosis?: string;
  incidenceDate?: string;
  severity?: 'mild' | 'moderate' | 'severe' | 'unknown';
  factorPercent?: number;
  factorPercentDate?: string;
  familyHistory?: 'first_degree' | 'second_degree' | 'third_degree' | 'none';
  HasInhibitors?: boolean;
  inhibitorLevel?: number;
  inhibitorScreeningDate?: string;
  inhibitors?: InhibitorEntry[];
  HasChronicDiseases?: boolean;
  chronicDiseases?: string[];
  chronicDiseaseOther?: string;
  bloodGroup?: string;
  longTermMedication?: boolean;
  testDates?: PatientTestDate[];
  otherMedicalTests?: OtherMedicalTest[];
}

export type TestType = 'FactorLevel' | 'InhibitorScreening' | 'HBV' | 'HCV' | 'HIV' | 'Other';

export interface PatientTestDate {
  testType: TestType;
  hasTaken: boolean;
  testDate?: string;
  result?: 'positive' | 'negative';
}

export interface PatientRequest {
  fullName: string;
  nationalIdNumber: string;
  dateOfBirth: string;
  gender: string;
  homeState: string;
  homeCityOrTown: string;
  homeLocality: string;
  residenceType: 'InsideSudan' | 'OutsideSudan';
  country?: string;
  cityOrTown?: string;
  locality?: string;
  state?: string;
  maritalStatus?: string;
  occupation?: string;
  contactNumber?: string;
  contactNumber1: string;
  contactNumber2?: string;
  vitalStatus?: 'Alive' | 'Died' | 'Unknown';
  hemophiliaCenterId: string;
  diagnosis: string;
  incidenceDate?: string;
  severity?: 'mild' | 'moderate' | 'severe' | 'unknown' | '';
  factorPercent?: number;
  factorPercentDate?: string;
  familyHistory?: 'first_degree' | 'second_degree' | 'third_degree' | 'none' | '';
  HasInhibitors?: boolean;
  inhibitorLevel?: number;
  inhibitorScreeningDate?: string;
  inhibitors?: InhibitorEntry[];
  HasChronicDiseases?: boolean;
  chronicDiseases?: string[];
  chronicDiseaseOther?: string;
  bloodGroup?: string;
  longTermMedication?: boolean;
  testDates?: PatientTestDate[];
  otherMedicalTests?: OtherMedicalTest[];
}

export interface InhibitorEntry {
  inhibitorLevel?: number;
  inhibitorScreeningDate?: string;
}

export interface VisitDrug {
  drugType: string;
  concentration: number;
  quantity: number;
  lotNumber?: string;
  factorId?: number;
}

export interface PatientVisit {
  id: number;
  patientId: number;
  visitDate: string;
  centerState?: string;
  centerName?: string;
  visitType?: 'telephone_consultation' | 'center_visit';
  serviceType?: 'new_visit' | 'followup' | 'hospital_admission';
  complaint?: string;
  complaintOther?: string;
  complaintDetails?: string;
  notes?: string;
  enteredBy?: string;
  factorLevelTestDates?: string[];
  inhibitorScreeningDates?: string[];
  viralScreeningDates?: string[];
  otherTestDates?: string[];
  createdAt?: string;
  otherMedicalTests?: OtherMedicalTest[];
  vitalStatus?: 'Alive' | 'Died' | 'Unknown';
  inhibitors?: InhibitorEntry[];
  managementPlan?: string;
  drugs?: VisitDrug[];
  diagnosisType?: 'new_patient' | 'followup' | 'admission' | 'new_visit' | 'hospital_admission';
}

export interface OtherMedicalTest {
  testName: string;
  testResult: string;
  testDate: string;
}

export interface PatientVisitRequest {
  patientId: number;
  visitDate: string;
  centerState?: string;
  centerName?: string;
  visitType?: 'telephone_consultation' | 'center_visit';
  serviceType: 'new_visit' | 'followup' | 'hospital_admission';
  contactRelation?: string;
  complaint?: string;
  complaintOther?: string;
  complaintDetails?: string;
  notes?: string;
  enteredBy?: string;
  factorLevelTestDates?: string[];
  inhibitorScreeningDates?: string[];
  viralScreeningDates?: string[];
  otherTestDates?: string[];
  otherMedicalTests?: OtherMedicalTest[];
  vitalStatus?: 'Alive' | 'Died' | 'Unknown';
  inhibitors?: InhibitorEntry[];
  managementPlan?: string;
  drugs?: VisitDrug[];
  diagnosisType?: 'new_patient' | 'followup' | 'admission';
}

export interface Treatment {
  id: number;
  patientId: number;
  treatmentCenter: string;
  treatmentType: string;
  indicationOfTreatment: string;
  lot: string;
  noteDate: string;
  quantityLot: number;
}

export interface TreatmentRequest {
  patientId: number;
  treatmentCenter: string;
  treatmentType: string;
  indicationOfTreatment: string;
  lot: string;
  noteDate: string;
  quantityLot: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}


export interface CellPhoneTreatment {
  id: number;
  patientId: number;
  cellTreatmentCenter: string;
  treatmentType: string;
  indicationOfTreatment: string;
  lot: string;
  noteDate: string;
  quantityLot: number;
}

export interface CellPhoneTreatmentRequest {
  patientId: number;
  cellTreatmentCenter: string;
  treatmentType: string;
  indicationOfTreatment: string;
  lot: string;
  noteDate: string;
  quantityLot: number;
  phoneNumber?: string;
  callDuration?: number;
  treatmentGuidance?: string;
  patientResponse?: string;
  followUpRequired?: boolean;
  callStatus?: 'scheduled' | 'in-progress' | 'completed' | 'missed';
  treatmentInstructions?: string;
  sideEffectsDiscussed?: string;
  nextCallDate?: string;
}

export interface MedicineDistribution {
  id: number;
  factorId: number;
  state: string;
  quantity: number;
  quantityDistributed: number;
  distributionDate: string;
  expiryDate: string;
  mg: number;
  companyName: string;
  category: string;
  status: string;
  deliveryDate: string;
}

export interface MedicineDistributionRequest {
  factorId: number;
  state: string;
  quantity: number;
  quantityDistributed: number;
  distributionDate: string;
  expiryDate: string;
  mg: number;
  companyName: string;
  category: string;
}

export interface FactorDistribution {
  id: number;
  factorId: number;
  factorName: string;
  state: string;
  quantityDistributed: number;
  distributionDate: string;
  
}

export interface FactorDistributionRequest {
  factorId: number;
  state: string;
  quantityDistributed: number;
  distributionDate: string;
}