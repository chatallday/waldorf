export interface CompactMentor {
  id: string; name: string; email: string; bio: string;
  specialties: string[]; location: string; status: string;
  directoryVisibility: boolean; subscriptionActive: boolean;
  gradeLevel: string; photoUrl: string; lessons: string;
}

let cache: CompactMentor[] | null = null;

export async function getDirectoryMentors(): Promise<CompactMentor[]> {
  if (cache) return cache;
  try {
    const res = await fetch('/directory-mentors.json');
    if (!res.ok) throw new Error('Failed to load');
    cache = await res.json();
    return cache!;
  } catch {
    return [];
  }
}
