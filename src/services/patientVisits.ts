import { apiClient } from '../lib/api';
import { PatientVisit, PatientVisitRequest } from '../types/api';

export class PatientVisitsService {
  static async getAll(): Promise<PatientVisit[]> {
    const data = await apiClient.get<PatientVisit[]>('/patientVisits');
    const visits = (Array.isArray(data) ? data : []).map(this.normalizeVisit);
    return visits.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  }

  static async getById(id: number): Promise<PatientVisit> {
    const data = await apiClient.get<PatientVisit>(`/patientVisits/${id}`);
    return this.normalizeVisit(data);
  }

  private static normalizeVisit(visit: any): PatientVisit {
    const diagnosisType = visit.DiagnosisType || visit.diagnosis_type || visit.diagnosisType;
    const serviceType = visit.ServiceType || visit.service_type || visit.serviceType;

    let finalServiceType: 'new_visit' | 'followup' | 'hospital_admission' | undefined;
    if (serviceType) {
      finalServiceType = serviceType;
    } else if (diagnosisType) {
      if (diagnosisType === 'new_patient') finalServiceType = 'new_visit';
      else if (diagnosisType === 'admission') finalServiceType = 'hospital_admission';
      else finalServiceType = diagnosisType;
    }

    let inhibitors: any[] = [];
    const inhibitorsField = visit.Inhibitors || visit.inhibitors;
    if (inhibitorsField && Array.isArray(inhibitorsField)) {
      inhibitors = inhibitorsField.map((inh: any) => ({
        inhibitorLevel: inh.InhibitorLevel || inh.inhibitorLevel || inh.inhibitor_level,
        inhibitorScreeningDate: inh.InhibitorScreeningDate || inh.inhibitorScreeningDate || inh.inhibitor_screening_date
      }));
    }

    let drugs: any[] = [];
    const drugsField = visit.Drugs || visit.drugs;
    if (drugsField && Array.isArray(drugsField)) {
      drugs = drugsField.map((drug: any) => ({
        drugType: drug.DrugType || drug.drugType || drug.drug_type || '',
        concentration: drug.Concentration || drug.concentration || 0,
        quantity: drug.Quantity || drug.quantity || 0,
        lotNumber: drug.LotNumber || drug.lotNumber || drug.lot_number,
        factorId: drug.FactorId || drug.factorId || drug.factor_id
      }));
    }

    return {
      id: visit.Id || visit.id,
      patientId: visit.PatientId || visit.patient_id || visit.patientId,
      visitDate: visit.VisitDate || visit.visit_date || visit.visitDate,
      centerState: visit.CenterState || visit.center_state || visit.centerState,
      centerName: visit.CenterName || visit.center_name || visit.centerName,
      visitType: visit.VisitType || visit.visit_type || visit.visitType,
      serviceType: finalServiceType,
      diagnosisType,
      complaint: visit.Complaint || visit.complaint,
      complaintOther: visit.ComplaintOther || visit.complaint_other || visit.complaintOther,
      complaintDetails: visit.ComplaintDetails || visit.complaint_details || visit.complaintDetails,
      notes: visit.Notes || visit.notes,
      enteredBy: visit.EnteredBy || visit.entered_by || visit.enteredBy,
      factorLevelTestDates: visit.FactorLevelTestDates || visit.factor_level_test_dates || visit.factorLevelTestDates || [],
      inhibitorScreeningDates: visit.InhibitorScreeningDates || visit.inhibitor_screening_dates || visit.inhibitorScreeningDates || [],
      viralScreeningDates: visit.ViralScreeningDates || visit.viral_screening_dates || visit.viralScreeningDates || [],
      otherTestDates: visit.OtherTestDates || visit.other_test_dates || visit.otherTestDates || [],
      createdAt: visit.CreatedAt || visit.created_at || visit.createdAt,
      vitalStatus: visit.VitalStatus || visit.vitalStatus || visit.vital_status,
      inhibitors: inhibitors.length > 0 ? inhibitors : undefined,
      managementPlan: visit.ManagementPlan || visit.managementPlan || visit.management_plan,
      drugs: drugs.length > 0 ? drugs : undefined,
    };
  }

  private static transformForAPI(visit: PatientVisitRequest): any {
    const transformed: any = {
      PatientId: visit.patientId,
      VisitDate: visit.visitDate,
      ServiceType: visit.serviceType,
      ContactRelation: visit.contactRelation || '',
      CenterState: visit.centerState || '',
      CenterName: visit.centerName || '',
      Complaint: visit.complaint || '',
      ComplaintOther: visit.complaintOther || '',
      ComplaintDetails: visit.complaintDetails || '',
      Notes: visit.notes || '',
      EnteredBy: visit.enteredBy || '',
      ManagementPlan: visit.managementPlan || '',
    };

    if (visit.vitalStatus !== undefined) {
      transformed.VitalStatus = visit.vitalStatus;
    }

    if (visit.diagnosisType) {
      transformed.DiagnosisType = visit.diagnosisType;
    }

    if (visit.visitType) {
      transformed.VisitType = visit.visitType;
    }

    if (visit.otherMedicalTests && visit.otherMedicalTests.length > 0) {
      transformed.OtherMedicalTests = visit.otherMedicalTests.map(test => ({
        TestName: test.testName,
        TestResult: test.testResult,
        TestDate: test.testDate
      }));
    }

    if (visit.inhibitors && visit.inhibitors.length > 0) {
      transformed.Inhibitors = visit.inhibitors.map(inh => ({
        InhibitorLevel: inh.inhibitorLevel,
        InhibitorScreeningDate: inh.inhibitorScreeningDate
      }));
    }

    if (visit.drugs && visit.drugs.length > 0) {
      transformed.Drugs = visit.drugs.map(drug => ({
        DrugType: drug.drugType,
        Concentration: drug.concentration,
        Quantity: drug.quantity,
        LotNumber: drug.lotNumber || '',
        FactorId: drug.factorId || 0
      }));
    }

    return transformed;
  }

  static async create(visit: PatientVisitRequest): Promise<PatientVisit> {
    const transformed = this.transformForAPI(visit);
    const data = await apiClient.post<PatientVisit>('/patientVisits', transformed);
    return this.normalizeVisit(data);
  }

  static async update(id: number, visit: PatientVisitRequest): Promise<void> {
    const transformed = this.transformForAPI(visit);
    await apiClient.put(`/patientVisits/${id}`, transformed);
  }

  static async delete(id: number): Promise<void> {
    await apiClient.delete(`/patientVisits/${id}`);
  }
}
