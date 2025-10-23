import {
  BackButtonContainer,
  BackButton as BackButtonButton,
} from './BackButton.styles.js';
import propTypes from 'prop-types';

const BackButton = ({ onClick }) => {
  return (
    <BackButtonContainer>
      <BackButtonButton
        onClick={onClick}
        aria-label="Go back to the previous page"
      >
        ← Back
      </BackButtonButton>
    </BackButtonContainer>
  );
};

BackButton.propTypes = {
  onClick: propTypes.func.isRequired,
};

export default BackButton;
