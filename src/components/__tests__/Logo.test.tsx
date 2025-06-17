import React from 'react';
import { render, screen } from '@testing-library/react';
import Logo from '../Logo';

describe('Logo', () => {
  it('renders with default size', () => {
    render(<Logo />);
    
    const logo = screen.getByAltText('ArtiFlare Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveStyle({
      width: '40px',
      height: '40px',
      objectFit: 'contain',
    });
  });

  it('renders with custom size', () => {
    render(<Logo size={60} />);
    
    const logo = screen.getByAltText('ArtiFlare Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveStyle({
      width: '60px',
      height: '60px',
      objectFit: 'contain',
    });
  });

  it('uses correct image source', () => {
    render(<Logo />);
    
    const logo = screen.getByAltText('ArtiFlare Logo');
    expect(logo).toHaveAttribute('src', `${process.env.PUBLIC_URL}/favicon.ico`);
  });
}); 