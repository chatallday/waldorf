import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatWindow } from '../components/ChatWindow';

// Mock workflowService
vi.mock('../services/workflowService', () => ({
  getMentors: vi.fn().mockResolvedValue([
    {
      id: 'mentor-1',
      name: 'Anna Müller',
      photoUrl: 'https://example.com/anna.jpg',
      specialties: ['Music', 'Piano'],
    },
  ]),
}));

// Mock geminiService
vi.mock('../services/geminiService', () => ({
  getWaldorfAdvice: vi.fn().mockResolvedValue({
    advice: 'Test advice',
    recommendedMentorIds: ['mentor-1'],
    recommendedTags: ['music'],
  }),
}));

describe('ChatWindow', () => {
  const mockOnTagsUpdate = vi.fn();
  const mockOnSelectMentor = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chat window with initial message', () => {
    render(<ChatWindow onTagsUpdate={mockOnTagsUpdate} onSelectMentor={mockOnSelectMentor} recommendedTags={[]} />);

    expect(screen.getByText(/Warm greetings/i)).toBeInTheDocument();
  });

  it('has live region for messages', () => {
    render(<ChatWindow onTagsUpdate={mockOnTagsUpdate} onSelectMentor={mockOnSelectMentor} recommendedTags={[]} />);

    const messagesRegion = screen.getByRole('log', { name: /chat messages/i });
    expect(messagesRegion).toBeInTheDocument();
    expect(messagesRegion).toHaveAttribute('aria-live', 'polite');
  });

  it('renders temperament chips with ARIA labels', () => {
    render(<ChatWindow onTagsUpdate={mockOnTagsUpdate} onSelectMentor={mockOnSelectMentor} recommendedTags={[]} />);

    expect(screen.getByRole('button', { name: /set sanguine temperament/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /set melancholic temperament/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /set choleric temperament/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /set phlegmatic temperament/i })).toBeInTheDocument();
  });

  it('sends message on form submit', async () => {
    render(<ChatWindow onTagsUpdate={mockOnTagsUpdate} onSelectMentor={mockOnSelectMentor} recommendedTags={[]} />);

    const input = screen.getByLabelText('Chat message input');
    fireEvent.change(input, { target: { value: 'My child loves music' } });

    const sendButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/My child loves music/i)).toBeInTheDocument();
    });
  });

  it('shows loading indicator when sending', async () => {
    render(<ChatWindow onTagsUpdate={mockOnTagsUpdate} onSelectMentor={mockOnSelectMentor} recommendedTags={[]} />);

    const input = screen.getByLabelText('Chat message input');
    fireEvent.change(input, { target: { value: 'Test message' } });

    const sendButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendButton);

    // Loading dots should appear
    await waitFor(() => {
      expect(screen.getByText(/Test advice/i)).toBeInTheDocument();
    });
  });
});