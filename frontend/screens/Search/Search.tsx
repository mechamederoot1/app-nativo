import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search as SearchIcon } from 'lucide-react-native';

const PEOPLE = [
  {
    id: 'p1',
    name: 'Alice Martins',
    location: 'São Paulo, SP',
    interests: ['Design', 'React Native', 'Eventos'],
    mutualCount: 6,
  },
  {
    id: 'p2',
    name: 'Bruno Lima',
    location: 'Florianópolis, SC',
    interests: ['Startups', 'Investimentos', 'Comunidade'],
    mutualCount: 3,
  },
  {
    id: 'p3',
    name: 'Carla Sousa',
    location: 'Recife, PE',
    interests: ['UX', 'Mentorias', 'Workshops'],
    mutualCount: 8,
  },
  {
    id: 'p4',
    name: 'Diego Andrade',
    location: 'Curitiba, PR',
    interests: ['Inteligência Artificial', 'Podcasts', 'Eventos'],
    mutualCount: 4,
  },
  {
    id: 'p5',
    name: 'Eduarda Campos',
    location: 'Rio de Janeiro, RJ',
    interests: ['Comunidade', 'Networking', 'Design'],
    mutualCount: 5,
  },
];

const ALL_TAGS = Array.from(
  new Set(PEOPLE.flatMap((person) => person.interests)),
).sort();

type Person = (typeof PEOPLE)[number];

type TagButtonProps = {
  tag: string;
  selected: boolean;
  onSelect: (tag: string) => void;
};

function TagButton({ tag, selected, onSelect }: TagButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.tag, selected && styles.tagSelected]}
      onPress={() => onSelect(tag)}
      activeOpacity={0.8}
    >
      <Text style={[styles.tagText, selected && styles.tagTextSelected]}>
        #{tag}
      </Text>
    </TouchableOpacity>
  );
}

function PersonRow({ person, onPress }: { person: Person; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.personRow} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.personAvatar}>
        <Text style={styles.personInitial}>{person.name[0]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.personName}>{person.name}</Text>
        <Text style={styles.personLocation}>{person.location}</Text>
        <View style={styles.personTagsRow}>
          {person.interests.slice(0, 3).map((interest) => (
            <View key={interest} style={styles.personTag}>
              <Text style={styles.personTagText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.mutualCount}>{person.mutualCount} em comum</Text>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredPeople = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return PEOPLE.filter((person) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        person.name.toLowerCase().includes(normalizedQuery) ||
        person.location.toLowerCase().includes(normalizedQuery) ||
        person.interests.some((interest) =>
          interest.toLowerCase().includes(normalizedQuery),
        );

      const matchesTag = selectedTag ? person.interests.includes(selectedTag) : true;

      return matchesQuery && matchesTag;
    });
  }, [query, selectedTag]);

  const handleSelectTag = useCallback((tag: string) => {
    setSelectedTag((current) => (current === tag ? null : tag));
  }, []);

  const renderPerson = useCallback<ListRenderItem<Person>>(
    ({ item }) => (
      <PersonRow person={item} onPress={() => router.push('/profile')} />
    ),
    [router],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.searchInputWrapper}>
          <SearchIcon size={18} color="#6b7280" />
          <TextInput
            placeholder="Buscar pessoas, eventos ou interesses"
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            accessibilityLabel="Campo de busca"
            returnKeyType="search"
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tendências para você</Text>
        </View>

        <FlatList<string>
          data={ALL_TAGS}
          horizontal
          keyExtractor={(tag) => tag}
          contentContainerStyle={{ paddingHorizontal: 4 }}
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          renderItem={({ item }) => (
            <TagButton tag={item} selected={item === selectedTag} onSelect={handleSelectTag} />
          )}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resultados</Text>
          <Text style={styles.resultCount}>
            {filteredPeople.length} {filteredPeople.length === 1 ? 'resultado' : 'resultados'}
          </Text>
        </View>

        <FlatList<Person>
          data={filteredPeople}
          keyExtractor={(person) => person.id}
          renderItem={renderPerson}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Nenhum perfil encontrado</Text>
              <Text style={styles.emptyStateSubtitle}>
                Ajuste os filtros ou tente um termo diferente para encontrar novas conexões.
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  resultCount: {
    fontSize: 14,
    color: '#64748b',
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    marginRight: 10,
  },
  tagSelected: {
    backgroundColor: '#0856d6',
  },
  tagText: {
    color: '#334155',
    fontWeight: '600',
  },
  tagTextSelected: {
    color: '#ffffff',
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  personAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  personInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#075985',
  },
  personName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  personLocation: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  personTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  personTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  personTagText: {
    fontSize: 12,
    color: '#475569',
  },
  mutualCount: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '600',
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
    textAlign: 'center',
  },
});
