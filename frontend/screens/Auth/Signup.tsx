import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Modal,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AuthButton from '../../components/AuthButton';
import { Eye, EyeOff, Mail, Lock, User, Calendar, ChevronRight, Check, Shield } from 'lucide-react-native';

export default function SignupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const totalSteps = 8;

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

  const handleSignup = () => {
    if (!acceptedTerms) {
      Alert.alert('Termos', 'Você precisa aceitar os termos para continuar.');
      return;
    }
    router.push('/feed');
  };

  const selectDate = (day: number) => {
    const today = new Date();
    const selectedDate = new Date(today.getFullYear(), today.getMonth(), day);
    setBirthDate(`${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`);
    setShowDatePicker(false);
  };

  // Password strength indicator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, color: '#e5e7eb', text: '' };

    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/[0-9]/)) strength++;
    if (pass.match(/[^a-zA-Z0-9]/)) strength++;

    const levels = [
      { strength: 1, color: '#ef4444', text: 'Fraca' },
      { strength: 2, color: '#f59e0b', text: 'Média' },
      { strength: 3, color: '#3b82f6', text: 'Forte' },
      { strength: 4, color: '#10b981', text: 'Muito forte' }
    ];

    return levels[strength - 1] || { strength: 0, color: '#e5e7eb', text: '' };
  };

  const passwordStrength = getPasswordStrength(password);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Qual seu nome?</Text>
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <User size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  placeholder="Nome"
                  placeholderTextColor="#9aa0a6"
                  value={firstName}
                  onChangeText={setFirstName}
                  style={styles.input}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={handleNext}
                />
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>E seu sobrenome?</Text>
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <User size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  placeholder="Sobrenome"
                  placeholderTextColor="#9aa0a6"
                  value={lastName}
                  onChangeText={setLastName}
                  style={styles.input}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={handleNext}
                />
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Qual seu e-mail?</Text>
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  placeholder="seu@email.com"
                  placeholderTextColor="#9aa0a6"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={handleNext}
                />
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Seu gênero?</Text>
            <View style={styles.inputGroup}>
              <View style={styles.genderRow}>
                {['Masculino', 'Feminino', 'Outro'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.genderOption,
                      gender === option && styles.genderOptionSelected
                    ]}
                    onPress={() => setGender(option)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.genderText,
                      gender === option && styles.genderTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Quando você nasceu?</Text>
            <View style={styles.inputGroup}>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Calendar size={20} color="#94a3b8" style={styles.inputIcon} />
                <Text style={[styles.input, { color: birthDate ? '#111827' : '#9aa0a6' }]}>
                  {birthDate || 'DD/MM/AAAA'}
                </Text>
                <ChevronRight size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Crie uma senha</Text>
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  placeholder="Senha forte"
                  placeholderTextColor="#9aa0a6"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={[styles.input, { paddingRight: 50 }]}
                  autoFocus
                  returnKeyType="next"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#6b7280" />
                  ) : (
                    <Eye size={18} color="#6b7280" />
                  )}
                </TouchableOpacity>
              </View>
              {password && (
                <View style={styles.passwordStrength}>
                  <View style={styles.strengthBar}>
                    <View
                      style={[
                        styles.strengthFill,
                        { width: `${(passwordStrength.strength / 4) * 100}%`, backgroundColor: passwordStrength.color }
                      ]}
                    />
                  </View>
                  <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                    {passwordStrength.text}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );

      case 7:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Confirme sua senha</Text>
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  placeholder="Repita a senha"
                  placeholderTextColor="#9aa0a6"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  style={[styles.input, { paddingRight: 50 }]}
                  autoFocus
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} color="#6b7280" />
                  ) : (
                    <Eye size={18} color="#6b7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case 8:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Termos de uso</Text>
            <View style={styles.termsContainer}>
              <View style={styles.termsIcon}>
                <Shield size={32} color="#0856d6" />
              </View>
              <Text style={styles.termsDescription}>
                Para continuar, precisamos que você leia e aceite nossos termos de serviço e política de privacidade.
              </Text>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkboxBox, acceptedTerms && styles.checkboxBoxChecked]}>
                  {acceptedTerms && <Check size={14} color="#ffffff" strokeWidth={3} />}
                </View>
                <Text style={styles.termsText}>
                  Li e aceito os{' '}
                  <Text style={styles.termsLink}>Termos de Uso</Text>
                  {' '}e a{' '}
                  <Text style={styles.termsLink}>Política de Privacidade</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBack} activeOpacity={0.7}>
                <Text style={styles.backBtn}>← Voltar</Text>
              </TouchableOpacity>
              <Text style={styles.logo}>Vibe</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      index < step && styles.progressDotActive
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.progressText}>Passo {step} de {totalSteps}</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {renderStep()}

              {/* Action Button */}
              <AuthButton
                title={step === totalSteps ? "Criar conta" : "Continuar"}
                onPress={step === totalSteps ? handleSignup : handleNext}
              />

              {/* Login Link */}
              {step === 1 && (
                <View style={styles.loginRow}>
                  <Text style={styles.loginText}>Já tem uma conta?</Text>
                  <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.7}>
                    <Text style={styles.loginLink}> Entrar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerModal}>
            <Text style={styles.datePickerTitle}>Selecione sua data de nascimento</Text>
            <View style={styles.calendarGrid}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <TouchableOpacity
                  key={day}
                  style={styles.calendarDay}
                  onPress={() => selectDate(day)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.calendarDayText}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowDatePicker(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  backBtn: {
    fontSize: 16,
    color: '#0856d6',
    fontWeight: '600',
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0856d6',
  },
  placeholder: {
    width: 60,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
  },
  progressDotActive: {
    backgroundColor: '#0856d6',
    width: 24,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
  },
  form: {
    width: '100%',
    alignItems: 'stretch',
  },
  stepContent: {
    marginBottom: 32,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  genderOption: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#0856d6',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  genderTextSelected: {
    color: '#0856d6',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordStrength: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  termsContainer: {
    alignItems: 'center',
    width: '100%',
  },
  termsIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  termsDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    width: '100%',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxBoxChecked: {
    backgroundColor: '#0856d6',
    borderColor: '#0856d6',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  termsLink: {
    color: '#0856d6',
    fontWeight: '600',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#374151',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0856d6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  datePickerModal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 20,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  calendarDay: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
});