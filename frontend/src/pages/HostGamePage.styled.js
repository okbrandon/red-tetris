import styled from 'styled-components';
import { Input } from './HomePage.styled';

export const SettingsPanel = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    margin-top: 1.5rem;
`;

export const SettingsHeading = styled.h2`
    margin: 0;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #f2e9ff;
`;

export const SettingRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    @media (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

export const SettingLabel = styled.label`
    font-size: 0.95rem;
    color: #d9c8ff;
`;

export const NumberInput = styled(Input)`
    max-width: 150px;
    text-align: center;
`;

export const ToggleLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 0.55rem;
    font-size: 0.95rem;
    color: #d9c8ff;
`;

export const Checkbox = styled.input`
    width: 1.1rem;
    height: 1.1rem;
    accent-color: #a259ff;
`;

export const SettingsHint = styled.span`
    font-size: 0.8rem;
    color: #b79cff;
    opacity: 0.8;
`;
