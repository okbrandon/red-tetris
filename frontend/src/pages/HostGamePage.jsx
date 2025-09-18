import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Wrapper, Card, Subtitle, StartButton, LogoTitle, Input } from './HomePage.styled';
import BackButton from '../components/BackButton';
import { SettingsPanel, SettingsHeading, SettingRow, SettingLabel, NumberInput, ToggleLabel, Checkbox, SettingsHint } from './HostGamePage.styled';
import { setLobbySettings } from '../features/lobby/lobbySlice';
import { showNotification } from '../features/notification/notificationSlice';
import { setGameMode } from '../features/game/gameSlice';

const HostGamePage = () => {
    const dispatch = useDispatch();
    const lobbySettings = useSelector((state) => state.lobby);
    const [roomName, setRoomName] = useState(() => lobbySettings.roomName || '');
    const [maxPlayers, setMaxPlayers] = useState(() => String(lobbySettings.maxPlayers || 4));
    const [isPrivate, setIsPrivate] = useState(() => Boolean(lobbySettings.isPrivate));
    const navigate = useNavigate();

    const handleHost = () => {
        const trimmed = roomName.trim();
        const parsedPlayers = Number.parseInt(maxPlayers, 10);
        const players = Number.isNaN(parsedPlayers) ? 4 : Math.max(2, Math.min(10, parsedPlayers));
        setMaxPlayers(String(players));
        dispatch(setLobbySettings({
            roomName: trimmed,
            host: true,
            maxPlayers: players,
            isPrivate,
            roomCode: '',
        }));
        dispatch(setGameMode('multiplayer'));
        dispatch(showNotification({ type: 'success', message: 'Lobby created! Share the code once it is ready.' }));
        // TODO: replace with real hosting flow once backend is ready
        navigate('/lobby');
    };

    return (
        <Wrapper>
            <BackButton />
            <LogoTitle>Host Game</LogoTitle>
            <Card>
                <Subtitle>Create a lobby and share the code with friends.</Subtitle>
                <Input
                    type='text'
                    value={roomName}
                    placeholder='Lobby name (optional)'
                    aria-label='Lobby name'
                    onChange={(event) => setRoomName(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') handleHost();
                    }}
                />
                <SettingsPanel>
                    <SettingsHeading>Lobby Settings</SettingsHeading>
                    <SettingRow>
                        <SettingLabel htmlFor='maxPlayers'>Max players</SettingLabel>
                        <NumberInput
                            id='maxPlayers'
                            type='number'
                            min={2}
                            max={10}
                            step={1}
                            value={maxPlayers}
                            aria-label='Maximum number of players'
                            onChange={(event) => {
                                setMaxPlayers(event.target.value);
                            }}
                            onBlur={(event) => {
                                const value = Number.parseInt(event.target.value, 10);
                                if (!Number.isNaN(value)) {
                                    const clamped = Math.max(2, Math.min(10, value));
                                    setMaxPlayers(String(clamped));
                                } else {
                                    setMaxPlayers('4');
                                }
                            }}
                        />
                    </SettingRow>
                    <ToggleLabel>
                        <Checkbox
                            type='checkbox'
                            checked={isPrivate}
                            onChange={(event) => setIsPrivate(event.target.checked)}
                        />
                        Private lobby (invite only)
                    </ToggleLabel>
                    <SettingsHint>Adjust who can join and how many players the lobby supports.</SettingsHint>
                </SettingsPanel>
                <StartButton onClick={handleHost}>
                    Create Lobby
                </StartButton>
            </Card>
        </Wrapper>
    );
};

export default HostGamePage;
