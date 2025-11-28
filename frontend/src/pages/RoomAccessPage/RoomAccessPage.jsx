import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Wrapper,
  Card,
  StartButton,
  LogoTitle,
  Input,
} from '../UsernameSetupPage/UsernameSetupPage.styles.js';
import BackButton from '@/components/Backbutton/BackButton.jsx';
import {
  JoinForm,
  JoinHint,
  JoinSection,
  RoomsSection,
  RoomsTitle,
  RoomsList,
  RoomButton,
  RoomHeader,
  RoomName,
  RoomBadge,
  RoomMetaRow,
  RoomsEmpty,
  JoinTitle,
} from './RoomAccessPage.styles.js';
import useGameFlow from '@/hooks/useGameFlow.js';
import { getModeDetails } from '@/utils/gameModes.js';

const RoomAccessPage = () => {
  const navigate = useNavigate();
  const { roomName: originalRoomName, availableRooms } = useSelector(
    (state) => state.game
  );
  const [roomName, setRoomName] = useState(originalRoomName ?? '');

  const { joinMultiplayerRoom } = useGameFlow({ roomName });

  const rooms = useMemo(
    () => (Array.isArray(availableRooms) ? availableRooms : []),
    [availableRooms]
  );
  const hasLoadedRooms = availableRooms !== null;

  const handleRoomSelect = (room) => {
    if (!room?.id) return;
    setRoomName(room.id);
    joinMultiplayerRoom(room.id);
  };

  const handleJoinSubmit = (event) => {
    event?.preventDefault();
    if (!roomName.trim()) return;
    joinMultiplayerRoom();
  };

  return (
    <Wrapper>
      <BackButton onClick={() => navigate('/menu')} />
      <LogoTitle>Multiplayer</LogoTitle>
      <Card>
        <JoinSection>
          <JoinTitle>Join or Create a room</JoinTitle>
          <JoinForm onSubmit={handleJoinSubmit}>
            <Input
              type="text"
              value={roomName}
              placeholder="Enter room name"
              aria-label="Room name"
              onChange={(event) => setRoomName(event.target.value)}
            />
            <StartButton type="submit" disabled={!roomName.trim()}>
              Join Lobby
            </StartButton>
          </JoinForm>
          <JoinHint>
            Prefer manual entry? Join or Create by typing a room name.
          </JoinHint>
        </JoinSection>

        <RoomsSection aria-live="polite">
          <RoomsTitle>Available Rooms</RoomsTitle>
          {rooms.length > 0 ? (
            <RoomsList>
              {rooms.map((room) => {
                const ownerName = room?.owner?.username ?? 'Unknown';
                const modeTitle =
                  getModeDetails(room?.mode)?.title || room?.mode || null;

                return (
                  <li key={room.id}>
                    <RoomButton
                      type="button"
                      onClick={() => handleRoomSelect(room)}
                      aria-label={`Join room ${room.id}${
                        modeTitle ? `, ${modeTitle}` : ''
                      }`}
                    >
                      <RoomHeader>
                        <RoomName>{room.id}</RoomName>
                        {modeTitle && <RoomBadge>{modeTitle}</RoomBadge>}
                      </RoomHeader>
                      <RoomMetaRow>
                        <span>
                          Hosted by <b>{ownerName}</b>
                        </span>
                        <span>···</span>
                        <span>
                          <b>
                            {room?.currentPlayers ?? 0}/{room?.maxPlayers ?? 0}
                          </b>{' '}
                          players
                        </span>
                      </RoomMetaRow>
                    </RoomButton>
                  </li>
                );
              })}
            </RoomsList>
          ) : (
            hasLoadedRooms && (
              <RoomsEmpty>
                No active rooms right now. Be the first to open one!
              </RoomsEmpty>
            )
          )}
        </RoomsSection>
      </Card>
    </Wrapper>
  );
};

export default RoomAccessPage;
