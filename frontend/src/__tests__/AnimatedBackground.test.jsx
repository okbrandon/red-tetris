import { render } from '@testing-library/react';
import AnimatedBackground from '../components/AnimatedBackground';

describe('AnimatedBackground', () => {
  it('mounts without crashing', () => {
    const { container } = render(<AnimatedBackground />);
    expect(container.firstChild).toBeTruthy();
  });
});
