import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LivingPanel } from '../components/LivingPanel';

describe('LivingPanel', () => {
  it('renders all four tabs', () => {
    render(<LivingPanel />);

    expect(screen.getByRole('tab', { name: /curriculum/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /rhythms/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /español/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /deutsch/i })).toBeInTheDocument();
  });

  it('shows Curriculum panel by default', () => {
    render(<LivingPanel />);

    expect(screen.getByRole('tabpanel', { name: /curriculum/i })).toBeInTheDocument();
    expect(screen.getByText(/Waldorf Handwork Spiral/i)).toBeInTheDocument();
  });

  it('switches to Rhythms panel when tab clicked', async () => {
    render(<LivingPanel />);

    fireEvent.click(screen.getByRole('tab', { name: /rhythms/i }));

    await waitFor(() => {
      expect(screen.getByRole('tabpanel', { name: /rhythms/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/Anthroposophical Nutrition/i)).toBeInTheDocument();
  });

  it('switches to Español panel when tab clicked', async () => {
    render(<LivingPanel />);

    fireEvent.click(screen.getByRole('tab', { name: /español/i }));

    await waitFor(() => {
      expect(screen.getByRole('tabpanel', { name: /español/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/Recursos en Español/i)).toBeInTheDocument();
  });

  it('switches to Deutsch panel when tab clicked', async () => {
    render(<LivingPanel />);

    fireEvent.click(screen.getByRole('tab', { name: /deutsch/i }));

    await waitFor(() => {
      expect(screen.getByRole('tabpanel', { name: /deutsch/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/Deutsche Waldorf-Ressourcen/i)).toBeInTheDocument();
  });

  it('applies aria-selected to active tab', () => {
    render(<LivingPanel />);

    const curriculumTab = screen.getByRole('tab', { name: /curriculum/i });
    expect(curriculumTab).toHaveAttribute('aria-selected', 'true');

    const rhythmsTab = screen.getByRole('tab', { name: /rhythms/i });
    expect(rhythmsTab).toHaveAttribute('aria-selected', 'false');
  });

  it('accepts initialSubTab prop', () => {
    render(<LivingPanel initialSubTab="rhythms" />);

    expect(screen.getByRole('tabpanel', { name: /rhythms/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /rhythms/i })).toHaveAttribute('aria-selected', 'true');
  });
});