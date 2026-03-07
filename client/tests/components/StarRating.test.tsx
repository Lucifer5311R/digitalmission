import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StarRating } from '../../src/components/common/StarRating';

describe('StarRating', () => {
  it('renders the correct number of stars', () => {
    render(<StarRating rating={3} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5); // default maxRating = 5
  });

  it('renders custom maxRating stars', () => {
    render(<StarRating rating={2} maxRating={10} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(10);
  });

  it('fills the correct number of stars', () => {
    const { container } = render(<StarRating rating={3} />);
    const filledStars = container.querySelectorAll('.fill-yellow-400');
    const emptyStars = container.querySelectorAll('.fill-gray-200');
    expect(filledStars).toHaveLength(3);
    expect(emptyStars).toHaveLength(2);
  });

  it('renders 0 rating with all empty stars', () => {
    const { container } = render(<StarRating rating={0} />);
    const filledStars = container.querySelectorAll('.fill-yellow-400');
    const emptyStars = container.querySelectorAll('.fill-gray-200');
    expect(filledStars).toHaveLength(0);
    expect(emptyStars).toHaveLength(5);
  });

  it('renders full rating with all filled stars', () => {
    const { container } = render(<StarRating rating={5} />);
    const filledStars = container.querySelectorAll('.fill-yellow-400');
    expect(filledStars).toHaveLength(5);
  });

  it('disables buttons when not interactive', () => {
    render(<StarRating rating={3} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn).toBeDisabled());
  });

  it('enables buttons when interactive', () => {
    const onChange = vi.fn();
    render(<StarRating rating={3} interactive onChange={onChange} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn).not.toBeDisabled());
  });

  it('calls onChange with correct rating on click', () => {
    const onChange = vi.fn();
    render(<StarRating rating={2} interactive onChange={onChange} />);
    const buttons = screen.getAllByRole('button');

    fireEvent.click(buttons[3]); // click 4th star
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('does not call onChange when not interactive', () => {
    const onChange = vi.fn();
    render(<StarRating rating={2} onChange={onChange} />);
    const buttons = screen.getAllByRole('button');

    fireEvent.click(buttons[3]);
    expect(onChange).not.toHaveBeenCalled();
  });
});
