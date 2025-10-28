import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import TopBar from '../../components/TopBar';
import BottomNav from '../../components/BottomNav';
import { getMyProfile, updateMyProfile, getCurrentUser } from '../../utils/api';
import { useRouter } from 'expo-router';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState('');
  const [hometown, setHometown] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [workplaceCompany, setWorkplaceCompany] = useState('');
  const [workplaceTitle, setWorkplaceTitle] = useState('');
  const [positions, setPositions] = useState<Array<any>>([]);
  const [education, setEducation] = useState<Array<any>>([]);
  const [showHometown, setShowHometown] = useState(true);
  const [showCurrentCity, setShowCurrentCity] = useState(true);
  const [showRelationshipStatus, setShowRelationshipStatus] = useState(true);
  const [showContactEmail, setShowContactEmail] = useState(false);
  const [showContactPhone, setShowContactPhone] = useState(false);
  const [showWorkplace, setShowWorkplace] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const prof = await getMyProfile();
        if (!mounted) return;
        setBio(prof.bio || '');
        setHometown(prof.hometown || '');
        setCurrentCity(prof.current_city || '');
        setRelationshipStatus(prof.relationship_status || '');
        setContactEmail(prof.contact_email || '');
        setContactPhone(prof.contact_phone || '');
        setWorkplaceCompany(prof.workplace_company || '');
        setWorkplaceTitle(prof.workplace_title || '');
        setPositions(Array.isArray(prof.positions) ? prof.positions : []);
        setEducation(Array.isArray(prof.education) ? prof.education : []);
        setShowHometown(prof.show_hometown !== false);
        setShowCurrentCity(prof.show_current_city !== false);
        setShowRelationshipStatus(prof.show_relationship_status !== false);
        setShowContactEmail(prof.show_contact_email === true);
        setShowContactPhone(prof.show_contact_phone === true);
        setShowWorkplace(prof.show_workplace !== false);
      } catch (err: any) {
        console.error('Erro ao carregar perfil:', err);
        Alert.alert('Erro', err?.message || 'Falha ao carregar perfil');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAddPosition = () =>
    setPositions([
      ...positions,
      { company: '', title: '', start: '', end: '' },
    ]);
  const handleRemovePosition = (idx: number) =>
    setPositions(positions.filter((_, i) => i !== idx));
  const handlePositionChange = (idx: number, key: string, value: string) => {
    const copy = [...positions];
    copy[idx] = { ...copy[idx], [key]: value };
    setPositions(copy);
  };

  const handleAddEducation = () =>
    setEducation([
      ...education,
      { institution: '', degree: '', start: '', end: '' },
    ]);
  const handleRemoveEducation = (idx: number) =>
    setEducation(education.filter((_, i) => i !== idx));
  const handleEducationChange = (idx: number, key: string, value: string) => {
    const copy = [...education];
    copy[idx] = { ...copy[idx], [key]: value };
    setEducation(copy);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        bio,
        hometown,
        current_city: currentCity,
        relationship_status: relationshipStatus,
        contact_email: contactEmail || undefined,
        contact_phone: contactPhone || undefined,
        workplace_company: workplaceCompany || undefined,
        workplace_title: workplaceTitle || undefined,
        connections_count: 0,
        show_hometown: showHometown,
        show_current_city: showCurrentCity,
        show_relationship_status: showRelationshipStatus,
        show_contact_email: showContactEmail,
        show_contact_phone: showContactPhone,
        show_workplace: showWorkplace,
        positions: positions.map((p) => ({
          company: p.company,
          title: p.title,
          start: p.start,
          end: p.end,
        })),
        education: education.map((e) => ({
          institution: e.institution,
          degree: e.degree,
          start: e.start,
          end: e.end,
        })),
      };
      await updateMyProfile(payload);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso');
      try {
        const me = await getCurrentUser();
        const username =
          me?.username ||
          `${me?.first_name || ''}${me?.last_name || ''}`
            .toLowerCase()
            .replace(/\s+/g, '');
        if (username) {
          router.replace(`/profile/${encodeURIComponent(username)}`);
        } else {
          router.back();
        }
      } catch {
        router.back();
      }
    } catch (err: any) {
      console.error('Erro ao salvar perfil:', err);
      Alert.alert('Erro', err?.message || 'Falha ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <TopBar />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Text style={styles.title}>Editar perfil</Text>

        <Text style={styles.label}>Biografia</Text>
        <TextInput
          style={styles.inputMultiline}
          multiline
          value={bio}
          onChangeText={setBio}
          placeholder="Fale sobre você"
        />

        <Text style={styles.label}>Cidade natal</Text>
        <TextInput
          style={styles.input}
          value={hometown}
          onChangeText={setHometown}
          placeholder="Cidade natal"
        />

        <Text style={styles.label}>Cidade atual</Text>
        <TextInput
          style={styles.input}
          value={currentCity}
          onChangeText={setCurrentCity}
          placeholder="Cidade atual"
        />

        <Text style={styles.label}>Relacionamento</Text>
        <TextInput
          style={styles.input}
          value={relationshipStatus}
          onChangeText={setRelationshipStatus}
          placeholder="Estado civil"
        />

        <Text style={styles.label}>Contato (email)</Text>
        <TextInput
          style={styles.input}
          value={contactEmail}
          onChangeText={setContactEmail}
          placeholder="email@exemplo.com"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Contato (telefone)</Text>
        <TextInput
          style={styles.input}
          value={contactPhone}
          onChangeText={setContactPhone}
          placeholder="(99) 9 9999-9999"
          keyboardType="phone-pad"
        />

        <View style={{ marginTop: 20, marginBottom: 12 }}>
          <Text style={[styles.label, { fontWeight: '800', marginBottom: 12 }]}>
            Visibilidade das Informações Pessoais
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>
            Escolha quais informações deseja mostrar no seu perfil
          </Text>

          <View style={styles.visibilityItem}>
            <View>
              <Text style={styles.visibilityLabel}>Cidade natal</Text>
              <Text style={styles.visibilityDescription}>
                {showHometown ? 'Visível no perfil' : 'Oculta no perfil'}
              </Text>
            </View>
            <Switch
              value={showHometown}
              onValueChange={setShowHometown}
              trackColor={{ false: '#cbd5e1', true: '#86efac' }}
              thumbColor={showHometown ? '#22c55e' : '#e2e8f0'}
            />
          </View>

          <View style={styles.visibilityItem}>
            <View>
              <Text style={styles.visibilityLabel}>Cidade atual</Text>
              <Text style={styles.visibilityDescription}>
                {showCurrentCity ? 'Visível no perfil' : 'Oculta no perfil'}
              </Text>
            </View>
            <Switch
              value={showCurrentCity}
              onValueChange={setShowCurrentCity}
              trackColor={{ false: '#cbd5e1', true: '#86efac' }}
              thumbColor={showCurrentCity ? '#22c55e' : '#e2e8f0'}
            />
          </View>

          <View style={styles.visibilityItem}>
            <View>
              <Text style={styles.visibilityLabel}>Estado civil</Text>
              <Text style={styles.visibilityDescription}>
                {showRelationshipStatus ? 'Visível no perfil' : 'Oculta no perfil'}
              </Text>
            </View>
            <Switch
              value={showRelationshipStatus}
              onValueChange={setShowRelationshipStatus}
              trackColor={{ false: '#cbd5e1', true: '#86efac' }}
              thumbColor={showRelationshipStatus ? '#22c55e' : '#e2e8f0'}
            />
          </View>

          <View style={styles.visibilityItem}>
            <View>
              <Text style={styles.visibilityLabel}>Email para contato</Text>
              <Text style={styles.visibilityDescription}>
                {showContactEmail ? 'Visível no perfil' : 'Oculto no perfil'}
              </Text>
            </View>
            <Switch
              value={showContactEmail}
              onValueChange={setShowContactEmail}
              trackColor={{ false: '#cbd5e1', true: '#86efac' }}
              thumbColor={showContactEmail ? '#22c55e' : '#e2e8f0'}
            />
          </View>

          <View style={styles.visibilityItem}>
            <View>
              <Text style={styles.visibilityLabel}>Telefone para contato</Text>
              <Text style={styles.visibilityDescription}>
                {showContactPhone ? 'Visível no perfil' : 'Oculto no perfil'}
              </Text>
            </View>
            <Switch
              value={showContactPhone}
              onValueChange={setShowContactPhone}
              trackColor={{ false: '#cbd5e1', true: '#86efac' }}
              thumbColor={showContactPhone ? '#22c55e' : '#e2e8f0'}
            />
          </View>

          <View style={styles.visibilityItem}>
            <View>
              <Text style={styles.visibilityLabel}>Informações de trabalho</Text>
              <Text style={styles.visibilityDescription}>
                {showWorkplace ? 'Visível no perfil' : 'Ocultas no perfil'}
              </Text>
            </View>
            <Switch
              value={showWorkplace}
              onValueChange={setShowWorkplace}
              trackColor={{ false: '#cbd5e1', true: '#86efac' }}
              thumbColor={showWorkplace ? '#22c55e' : '#e2e8f0'}
            />
          </View>
        </View>

        <Text style={styles.label}>Trabalho - Empresa</Text>
        <TextInput
          style={styles.input}
          value={workplaceCompany}
          onChangeText={setWorkplaceCompany}
          placeholder="Empresa"
        />

        <Text style={styles.label}>Trabalho - Cargo</Text>
        <TextInput
          style={styles.input}
          value={workplaceTitle}
          onChangeText={setWorkplaceTitle}
          placeholder="Cargo"
        />

        <View style={{ marginTop: 12 }}>
          <Text style={[styles.label, { fontWeight: '800' }]}>
            Cargos e Empregos
          </Text>
          {positions.map((pos, i) => (
            <View key={`pos_${i}`} style={styles.rowItem}>
              <TextInput
                placeholder="Empresa"
                style={styles.rowInput}
                value={pos.company}
                onChangeText={(v) => handlePositionChange(i, 'company', v)}
              />
              <TextInput
                placeholder="Cargo"
                style={styles.rowInput}
                value={pos.title}
                onChangeText={(v) => handlePositionChange(i, 'title', v)}
              />
              <TextInput
                placeholder="Início"
                style={styles.rowInputSmall}
                value={pos.start}
                onChangeText={(v) => handlePositionChange(i, 'start', v)}
              />
              <TextInput
                placeholder="Fim"
                style={styles.rowInputSmall}
                value={pos.end}
                onChangeText={(v) => handlePositionChange(i, 'end', v)}
              />
              <TouchableOpacity
                onPress={() => handleRemovePosition(i)}
                style={styles.removeBtn}
              >
                <Text>Remover</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={handleAddPosition} style={styles.addBtn}>
            <Text>Adicionar cargo</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={[styles.label, { fontWeight: '800' }]}>Formações</Text>
          {education.map((edu, i) => (
            <View key={`edu_${i}`} style={styles.rowItem}>
              <TextInput
                placeholder="Instituição"
                style={styles.rowInput}
                value={edu.institution}
                onChangeText={(v) => handleEducationChange(i, 'institution', v)}
              />
              <TextInput
                placeholder="Grau"
                style={styles.rowInput}
                value={edu.degree}
                onChangeText={(v) => handleEducationChange(i, 'degree', v)}
              />
              <TextInput
                placeholder="Início"
                style={styles.rowInputSmall}
                value={edu.start}
                onChangeText={(v) => handleEducationChange(i, 'start', v)}
              />
              <TextInput
                placeholder="Fim"
                style={styles.rowInputSmall}
                value={edu.end}
                onChangeText={(v) => handleEducationChange(i, 'end', v)}
              />
              <TouchableOpacity
                onPress={() => handleRemoveEducation(i)}
                style={styles.removeBtn}
              >
                <Text>Remover</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={handleAddEducation} style={styles.addBtn}>
            <Text>Adicionar formação</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Salvando...' : 'Salvar perfil'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNav active="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
    color: '#0f172a',
  },
  label: { color: '#64748b', marginTop: 8, marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6eef8',
    padding: 10,
    borderRadius: 8,
  },
  inputMultiline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6eef8',
    padding: 10,
    borderRadius: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  visibilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  visibilityLabel: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  visibilityDescription: {
    color: '#94a3b8',
    fontSize: 12,
  },
  rowItem: {
    marginBottom: 8,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eef2ff',
  },
  rowInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6eef8',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  rowInputSmall: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6eef8',
    padding: 8,
    borderRadius: 6,
    width: 100,
    marginBottom: 6,
  },
  removeBtn: { marginTop: 6, alignSelf: 'flex-end' },
  addBtn: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtn: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '800' },
});
