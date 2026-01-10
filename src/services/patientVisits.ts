import { apiClient } from '../lib/api';
import { PatientVisit, PatientVisitRequest } from '../types/api';

export class PatientVisitsService {
  static async getAll(): Promise<PatientVisit[]> {
    const data = await apiClient.get<PatientVisit[]>('/patientVisits');
    return (Array.isArray(data) ? data : []).map(this.normalizeVisit);
  }

  static async getById(id: number): Promise<PatientVisit> {
    const data = await apiClient.get<PatientVisit>(`/patientVisits/${id}`);
    return this.normalizeVisit(data);
  }

  private static normalizeVisit(visit: any): PatientVisit {
    return {
      id: visit.Id || visit.id,
      patientId: visit.PatientId || visit.patient_id || visit.patientId,
      visitDate: visit.VisitDate || visit.visit_date || visit.visitDate,
      centerState: visit.CenterState || visit.center_state || visit.centerState,
      centerName: visit.CenterName || visit.center_name || visit.centerName,
      visitType: visit.VisitType || visit.visit_type || visit.visitType,
      diagnosisType: visit.DiagnosisType || visit.diagnosis_type || visit.diagnosisType,
      complaint: visit.Complaint || visit.complaint,
      complaintOther: visit.ComplaintOther || visit.complaint_other || visit.complaintOther,
      complaintDetails: visit.ComplaintDetails || visit.complaint_details || visit.complaintDetails,
      notes: visit.Notes || visit.notes,
      enteredBy: visit.EnteredBy || visit.entered_by || visit.enteredBy,
      factorLevelTestDates: visit.FactorLevelTestDates || visit.factor_level_test_dates || visit.factorLevelTestDates || [],
      inhibitorScreeningDates: visit.InhibitorScreeningDates || visit.inhibitor_screening_dates || visit.inhibitorScreeningDates || [],
      viralScreeningDates: visit.ViralScreeningDates || visit.viral_screening_dates || visit.viralScreeningDates || [],
      otherTestDates: visit.OtherTestDates || visit.other_test_dates || visit.otherTestDates || [],
      hbsagScreenDates: visit.HbsagScreenDates || visit.hbsag_screen_dates || visit.hbsagScreenDates || [],
      createdAt: visit.CreatedAt || visit.created_at || visit.createdAt,
    };
  }

  private static transformForAPI(visit: PatientVisitRequest): any {
    const transformed: any = {
      PatientId: visit.patientId,
      VisitDate: visit.visitDate,
      DiagnosisType: visit.diagnosisType,
      ContactRelation: visit.contactRelation || '',
      CenterState: visit.centerState || '',
      CenterName: visit.centerName || '',
      Complaint: visit.complaint || '',
      ComplaintOther: visit.complaintOther || '',
      ComplaintDetails: visit.complaintDetails || '',
      Notes: visit.notes || '',
      EnteredBy: visit.enteredBy || '',
    };

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
