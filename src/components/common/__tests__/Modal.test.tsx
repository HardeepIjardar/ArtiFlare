import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../Modal';

describe('Modal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with default title when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );
    
    expect(screen.getByText('Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('renders modal with custom title', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Custom Title">
        <div>Modal Content</div>
      </Modal>
    );
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );
    
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders children content correctly', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div data-testid="test-content">
          <h1>Test Heading</h1>
          <p>Test paragraph</p>
        </div>
      </Modal>
    );
    
    const content = screen.getByTestId('test-content');
    expect(content).toBeInTheDocument();
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('Test paragraph')).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );
    
    const modalOverlay = screen.getByText('Modal').closest('div');
    expect(modalOverlay).toHaveClass('fixed', 'inset-0', 'bg-gray-600', 'bg-opacity-50', 'overflow-y-auto', 'h-full', 'w-full', 'z-50', 'flex', 'justify-center', 'items-center');
    
    const modalContent = screen.getByText('Modal Content').closest('div');
    expect(modalContent?.parentElement).toHaveClass('relative', 'p-8', 'bg-white', 'w-full', 'max-w-md', 'm-auto', 'flex-col', 'flex', 'rounded-lg', 'shadow-lg');
  });
}); 