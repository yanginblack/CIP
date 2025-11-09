export type Appointment = {
  id: string;
  startUtc: string;
  staff: string;
  notes: string | null;
  department?: string;
  serviceName?: string;
};

export type CheckInStep =
  | 'welcome'
  | 'language-selection'
  | 'contact-info'
  | 'visitor-assistance'
  | 'search'
  | 'appointments'
  | 'department-routing'
  | 'agent-interaction'
  | 'confirmation'
  | 'help';

export interface BaseStepProps {
  onStepChange: (step: CheckInStep) => void;
  onReset: () => void;
}

export interface WelcomeStepProps extends BaseStepProps {
  isLoading: boolean;
  onSubmit: (data: { firstName: string; lastName: string }) => void;
  startCheckIn?: () => void;
  cancelCheckIn?: () => void;
  isListening?: boolean;
  isCheckInSpeaking?: boolean;
  isVoiceSupported?: boolean;
  formRegister: any;
  handleSubmit: any;
  formErrors: any;
}

export interface AppointmentsListProps extends BaseStepProps {
  appointments: Appointment[];
  userInfo: { firstName: string; lastName: string } | null;
  onAppointmentSelect: (appointment: Appointment) => void;
  formatDateTime: (dateString: string) => string;
  isSpeaking: boolean;
  onToggleAudio: () => void;
  isAudioSupported: boolean;
}

export interface DepartmentRoutingProps extends BaseStepProps {
  selectedAppointment: Appointment;
  isLoading: boolean;
  onCheckIn: () => void;
  formatDateTime: (dateString: string) => string;
}

export interface ConfirmationStepProps extends BaseStepProps {
  selectedAppointment: Appointment | null;
  formatDateTime: (dateString: string) => string;
}

export interface HelpStepProps extends BaseStepProps {
  onAgentRequest: () => void;
  isSpeaking?: boolean;
  onToggleAudio?: () => void;
  isAudioSupported?: boolean;
}

export interface PersistentNavigationProps {
  currentStep: CheckInStep;
  onReset: () => void;
  onAgentRequest: () => void;
}