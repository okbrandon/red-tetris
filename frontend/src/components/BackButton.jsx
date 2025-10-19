import { BackButtonContainer, BackButton as BackButtonButton } from './BackButton.styled.js';

const BackButton = ({ onClick }) => {
  return (
    <BackButtonContainer>
      <BackButtonButton onClick={onClick} aria-label="Go back to the previous page">
        ← Back
      </BackButtonButton>
    </BackButtonContainer>
  );
};

export default BackButton;
