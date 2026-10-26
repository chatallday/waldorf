import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GlobalSearchBar } from '../components/GlobalSearchBar';

// Mock dependencies
vi.mock('../services/documentService', () => ({
  documentService: {
    getAllDocuments: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../data/mentors', () => ({
  MENTORS: [
    {
      id: 'mentor-1',
      name: 'Anna Müller',
      bio: 'Music teacher',
      location: 'Berlin, Germany',
      specialties: ['Music', 'Piano'],
      directoryVisibility: true,
    },
    {
      id: 'mentor-2',
      name: 'Bob Smith',
      bio: 'Handwork teacher',
      location: 'London, UK',
      specialties: ['Handwork', 'Knitting'],
      directoryVisibility: true,
    },
  ],
}));

vi.mock('../services/geminiService', () => ({
  crossWikiSearchWithAI: vi.fn().mockResolvedValue(null),
}));

vi.mock('../services/workflowService', () => ({
  getResources: vi.fn().mockResolvedValue([]),
}));

describe('GlobalSearchBar', () => {
  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input with correct ARIA attributes', () => {
    render(<GlobalSearchBar onNavigate={mockOnNavigate} />);

    const input = screen.getByLabelText('Search The Waldorf Path');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('aria-controls', 'search-results');
  });

  it('shows results when query is typed', async () => {
    render(<GlobalSearchBar onNavigate={mockOnNavigate} />);

    const input = screen.getByLabelText('Search The Waldorf Path');
    fireEvent.change(input, { target: { value: 'music' } });

    await waitFor(() => {
      const results = screen.getByRole('listbox', { name: /search results/i });
      expect(results).toBeInTheDocument();
    });
  });

  it('navigates on result selection', async () => {
    render(<GlobalSearchBar onNavigate={mockOnNavigate} />);

    const input = screen.getByLabelText('Search The Waldorf Path');
    fireEvent.change(input, { target: { value: 'anna' } });

    await waitFor(() => {
      const result = screen.getByRole('option', { name: /Anna Müller/i });
      fireEvent.click(result);
    });

    expect(mockOnNavigate).toHaveBeenCalledWith('directory', { mentorId: 'mentor-1' });
  });

  it('handles keyboard navigation', async () => {
    render(<GlobalSearchBar onNavigate={mockOnNavigate} />);

    const input = screen.getByLabelText('Search The Waldorf Path');
    fireEvent.change(input, { target: { value: 'teacher' } });

    await waitFor(() => {
      const results = screen.getByRole('listbox', { name: /search results/i });
      expect(results).toBeInTheDocument();
    });

    // Arrow down to select first result
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnNavigate).toHaveBeenCalled();
  });

  it('clears search on escape', async () => {
    render(<GlobalSearchBar onNavigate={mockOnNavigate} />);

    const input = screen.getByLabelText('Search The Waldorf Path');
    fireEvent.change(input, { target: { value: 'music' } });

    await waitFor(() => {
      expect(screen.getByRole('listbox', { name: /search results/i })).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('listbox', { name: /search results/i })).not.toBeInTheDocument();
    });
  });
});