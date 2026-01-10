import React, { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { PatientVisit, PatientVisitRequest, Patient, TreatmentRequest, Factor } from '../../types/api';
import { TreatmentsService } from '../../services/treatments';
import { FactorsService } from '../../services/factors';

interface PatientVisitFormProps {
  visit?: PatientVisit | null;
  patients: Patient[];
  factors: Factor[];
  onSave: (visit: PatientVisitRequest) => void;
  onCancel: () => void;
}

const COMPLAINT_OPTIONS = [
  'Joint hemarthrosis',
  'Intracranial hemorrhage',
  'Iliopsoas hematoma',
  'Hematemesis',
  'Melena',
  'Gum bleeding',
  'Tooth extraction',
  'Tongue bleeding',
  'Epistaxis',
  'Hematuria',
  'Crush injury/RTA',
  'Hemorrhagic cyst',
  'Menorrhagia',
  'Subconjunctival bleeding',
  'Orbital hematoma',
  'Preoperative preparation/intervention',
  'Labour',
  'Circumcision',
  'Other',
];

const STATE_CENTERS: Record<string, string[]> = {
  'Khartoum': ['Khartoum Teaching Hospital', 'Omdurman Hospital', 'Bahri Hospital', 'Ibn Sina Hospital', 'Royal Care Hospital'],
  'Al Jazirah': ['Wad Madani Teaching Hospital', 'Al Managil Hospital'],
  'White Nile': ['Rabak Hospital', 'Kosti Hospital'],
  'Blue Nile': ['Ad-Damazin Hospital'],
  'Northern': ['Dongola Hospital', 'Merowe Hospital'],
  'River Nile': ['Atbara Teaching Hospital', 'Shendi Hospital'],
  'Red Sea': ['Port Sudan Teaching Hospital'],
  'Kassala': ['Kassala Teaching Hospital'],
  'Al Qadarif': ['Al Qadarif Hospital'],
  'Sennar': ['Sennar Hospital'],
  'North Kordofan': ['El Obeid Teaching Hospital'],
  'South Kordofan': ['Kadugli Hospital'],
  'West Kordofan': ['El Fula Hospital'],
  'Central Darfur': ['Zalingei Hospital'],
  'North Darfur': ['El Fasher Hospital'],
  'South Darfur': ['Nyala Teaching Hospital'],
  'East Darfur': ['Ed Daein Hospital'],
  'West Darfur': ['El Geneina Hospital']
};

export const PatientVisitForm: React.FC<PatientVisitFormProps> = ({
  visit,
  patients,
  factors,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<PatientVisitRequest>({
    patientId: 0,
    visitDate: new Date().toISOString().split('T')[0],
    centerState: '',
    centerName: '',
    visitType: undefined,
    diagnosisType: 'followup',
    complaint: '',
    complaintOther: '',
    complaintDetails: '',
    notes: '',
    enteredBy: '',
  });

  const [followUpDate, setFollowUpDate] = useState('');
  const [treatmentData, setTreatmentData] = useState({
    factorId: 0,
    lot: '',
    quantityLot: 0,
    indicationOfTreatment: '',
  });

  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const patientSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visit) {
      const visitDate = visit.visitDate ? new Date(visit.visitDate).toISOString().split('T')[0] : '';
      const patient = patients.find(p => p.id === visit.patientId);

      setFormData({
        patientId: visit.patientId,
        visitDate,
        centerState: visit.centerState || '',
        centerName: visit.centerName || '',
        visitType: visit.visitType,
        diagnosisType: visit.diagnosisType || 'followup',
            complaint: visit.complaint || '',
        complaintOther: visit.complaintOther || '',
        complaintDetails: visit.complaintDetails || '',
        notes: visit.notes || '',
        enteredBy: visit.enteredBy || '',
      });

      if (patient) {
        setPatientSearch(`${patient.fullName} - ${patient.nationalIdNumber}`);
      }
    }
  }, [visit, patients]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (patientSearchRef.current && !patientSearchRef.current.contains(event.target as Node)) {
        setShowPatientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let notesWithFollowUp = formData.notes || '';
    if (formData.diagnosisType === 'admission' && followUpDate) {
      const followUpText = `\nFollow-up Date: ${new Date(followUpDate).toLocaleDateString()}`;
      notesWithFollowUp = notesWithFollowUp ? `${notesWithFollowUp}${followUpText}` : followUpText.trim();
    }

    const submitData: any = {
      patientId: formData.patientId,
      visitDate: new Date(formData.visitDate).toISOString(),
      centerState: formData.centerState,
      centerName: formData.centerName,
      diagnosisType: formData.diagnosisType,
      complaint: formData.complaint,
      complaintOther: formData.complaintOther,
      complaintDetails: formData.complaintDetails,
      notes: notesWithFollowUp,
      enteredBy: formData.enteredBy,
    };

    if (formData.visitType) {
      submitData.visitType = formData.visitType;
    }

    onSave(submitData);

    if (formData.visitType === 'center_visit' && treatmentData.factorId) {
      const treatmentRequest: TreatmentRequest = {
        patientId: formData.patientId,
        treatmentCenter: formData.centerName || '',
        treatmentType: 'On-demand',
        indicationOfTreatment: treatmentData.indicationOfTreatment || '',
        lot: treatmentData.lot || '',
        noteDate: new Date(formData.visitDate).toISOString(),
        quantityLot: treatmentData.quantityLot,
      };

      try {
        await TreatmentsService.create(treatmentRequest);

        const selectedFactor = factors.find(f => f.id === treatmentData.factorId);
        if (selectedFactor && treatmentData.quantityLot > 0) {
          const newQuantity = selectedFactor.quantity - treatmentData.quantityLot;
          await FactorsService.update(selectedFactor.id, {
            name: selectedFactor.name,
            lotNo: selectedFactor.lotNo,
            quantity: Math.max(0, newQuantity),
            expiryDate: selectedFactor.expiryDate,
            mg: selectedFactor.mg,
            drugType: selectedFactor.drugType,
            supplierName: selectedFactor.supplierName,
            companyName: selectedFactor.companyName,
          });
        }
      } catch (error) {
        console.error('Error creating treatment or updating factor:', error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === 'centerState') {
      setFormData(prev => ({
        ...prev,
        centerState: value || undefined,
        centerName: ''
      }));
    } else if (name === 'visitType') {
      setFormData(prev => ({
        ...prev,
        visitType: value as 'telephone_consultation' | 'center_visit' | undefined
      }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : parseInt(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value || undefined }));
    }
  };

  const handleTreatmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name === 'factorId') {
      const selectedFactor = factors.find(f => f.id === parseInt(value, 10));
      setTreatmentData(prev => ({
        ...prev,
        factorId: parseInt(value, 10) || 0,
        lot: selectedFactor?.lotNo || '',
      }));
    } else {
      setTreatmentData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
      }));
    }
  };

  const availableCenters = formData.centerState ? STATE_CENTERS[formData.centerState] || [] : [];
  const selectedPatient = patients.find(p => p.id === formData.patientId);

  const filteredPatients = patients.filter(patient => {
    const searchLower = patientSearch.toLowerCase();
    return (
      patient.fullName?.toLowerCase().includes(searchLower) ||
      patient.nationalIdNumber?.toLowerCase().includes(searchLower) ||
      `${patient.fullName} - ${patient.nationalIdNumber}`.toLowerCase().includes(searchLower)
    );
  });

  const handlePatientSelect = (patient: Patient) => {
    setFormData(prev => ({ ...prev, patientId: patient.id }));
    setPatientSearch(`${patient.fullName} - ${patient.nationalIdNumber}`);
    setShowPatientDropdown(false);
  };

  const handlePatientSearchChange = (value: string) => {
    setPatientSearch(value);
    setShowPatientDropdown(true);
    if (!value) {
      setFormData(prev => ({ ...prev, patientId: 0 }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl my-8 shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg z-10">
          <h3 className="text-xl font-semibold text-gray-800">
            {visit ? 'Edit Patient Visit' : 'Add New Patient Visit'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-blue-900 mb-4">Visit Information</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div ref={patientSearchRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient *
                </label>
                {patients.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-red-300 bg-red-50 rounded-lg text-sm text-red-600">
                    No patients available. Please add patients first.
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={patientSearch}
                      onChange={(e) => handlePatientSearchChange(e.target.value)}
                      onFocus={() => setShowPatientDropdown(true)}
                      placeholder="Search by name or ID..."
                      required={formData.patientId === 0}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                )}
                {showPatientDropdown && filteredPatients.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredPatients.map(patient => (
                      <div
                        key={patient.id}
                        onClick={() => handlePatientSelect(patient)}
                        className={`px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                          formData.patientId === patient.id ? 'bg-blue-100' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">{patient.fullName}</div>
                        <div className="text-sm text-gray-600">{patient.nationalIdNumber}</div>
                      </div>
                    ))}
                  </div>
                )}
                {showPatientDropdown && patientSearch && filteredPatients.length === 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm text-gray-500">
                    No patients found matching "{patientSearch}"
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visit Date *
                </label>
                <input
                  type="date"
                  name="visitDate"
                  value={formData.visitDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visit Type *
                </label>
                <select
                  name="visitType"
                  value={formData.visitType || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Select Visit Type</option>
                  <option value="telephone_consultation">Telephone Consultation</option>
                  <option value="center_visit">Center Visit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis Type *
                </label>
                <select
                  name="diagnosisType"
                  value={formData.diagnosisType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="new_patient">New Patient</option>
                  <option value="followup">Follow-up</option>
                  <option value="admission">Admission for Patients</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Center State *
                </label>
                <select
                  name="centerState"
                  value={formData.centerState}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Select State</option>
                  <option value="Khartoum">Khartoum</option>
                  <option value="Al Jazirah">Al Jazirah</option>
                  <option value="White Nile">White Nile</option>
                  <option value="Blue Nile">Blue Nile</option>
                  <option value="Northern">Northern</option>
                  <option value="River Nile">River Nile</option>
                  <option value="Red Sea">Red Sea</option>
                  <option value="Kassala">Kassala</option>
                  <option value="Al Qadarif">Al Qadarif</option>
                  <option value="Sennar">Sennar</option>
                  <option value="North Kordofan">North Kordofan</option>
                  <option value="South Kordofan">South Kordofan</option>
                  <option value="West Kordofan">West Kordofan</option>
                  <option value="Central Darfur">Central Darfur</option>
                  <option value="North Darfur">North Darfur</option>
                  <option value="South Darfur">South Darfur</option>
                  <option value="East Darfur">East Darfur</option>
                  <option value="West Darfur">West Darfur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Center Name *
                </label>
                <select
                  name="centerName"
                  value={formData.centerName}
                  onChange={handleChange}
                  required
                  disabled={!formData.centerState}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{formData.centerState ? 'Select Center' : 'Select State First'}</option>
                  {availableCenters.map(center => (
                    <option key={center} value={center}>{center}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entered By *
              </label>
              <input
                type="text"
                name="enteredBy"
                value={formData.enteredBy}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Staff name"
              />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-green-900 mb-4">Complaint Information</h4>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complaint
              </label>
              <select
                name="complaint"
                value={formData.complaint || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Select Complaint</option>
                {COMPLAINT_OPTIONS.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {formData.complaint === 'Other' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please specify complaint
                </label>
                <input
                  type="text"
                  name="complaintOther"
                  value={formData.complaintOther}
                  onChange={handleChange}
                  placeholder="Describe the complaint"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complaint Details
              </label>
              <textarea
                name="complaintDetails"
                value={formData.complaintDetails}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="Detailed description of the complaint"
              />
            </div>
          </div>

          {formData.diagnosisType === 'admission' && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-teal-900 mb-4">Follow-up Information</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {formData.visitType === 'center_visit' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-orange-900 mb-4">Factor Treatment Details</h4>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indication of Treatment
                </label>
                <textarea
                  name="indicationOfTreatment"
                  value={treatmentData.indicationOfTreatment}
                  onChange={handleTreatmentChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  placeholder="Enter indication for treatment"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Medicine/Drug (Optional)
                </label>
                <select
                  name="factorId"
                  value={treatmentData.factorId}
                  onChange={handleTreatmentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value={0}>Select a medicine/drug</option>
                  {factors.filter(f => f.quantity > 0).map(factor => (
                    <option key={factor.id} value={factor.id}>
                      {factor.name} - Lot: {factor.lotNo} (Stock: {factor.quantity})
                    </option>
                  ))}
                </select>
                {factors.filter(f => f.quantity > 0).length === 0 && (
                  <p className="text-xs text-red-600 mt-1">No medicines/drugs available in stock</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Factor distribution is optional for patient visits
                </p>
              </div>

              {treatmentData.factorId > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lot Number
                    </label>
                    <input
                      type="text"
                      value={treatmentData.lot}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantityLot"
                      value={treatmentData.quantityLot}
                      onChange={handleTreatmentChange}
                      min="1"
                      max={factors.find(f => f.id === treatmentData.factorId)?.quantity || 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Enter quantity"
                    />
                    {treatmentData.factorId > 0 && (
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        Available in stock: {factors.find(f => f.id === treatmentData.factorId)?.quantity || 0} units
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Stock will be decreased when treatment is saved
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Followup Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Followup notes about the visit"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={patients.length === 0 || formData.patientId === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {visit ? 'Update Visit' : 'Create Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
