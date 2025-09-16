import { useNavigate } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { BackButtonContainer, BackButton as BackButtonButton } from '../pages/HomePage.styled';

const BackButton = () => {
    const navigate = useNavigate();

    const canGoBack = useMemo(() => {
        if (typeof window === 'undefined') return false;
        const historyState = window.history?.state;
        return typeof historyState?.idx === 'number' && historyState.idx > 0;
    }, []);

    const handleBack = useCallback(() => {
        if (canGoBack) {
            navigate(-1);
        } else {
            navigate('/');
        }
    }, [canGoBack, navigate]);

    return (
        <BackButtonContainer>
            <BackButtonButton onClick={handleBack} aria-label='Go back to the previous screen'>
                ← Back
            </BackButtonButton>
        </BackButtonContainer>
    );
};

export default BackButton;
