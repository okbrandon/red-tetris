import PropTypes from 'prop-types';
import {
    Overlay,
    Dialog,
    OutcomeBadge,
    Title,
    Message,
    ActionButton,
} from './GameResultModal.styled.js';
import { requestRestartGame } from '../features/socket/socketThunks.js';

const VARIANTS = {
    win: {
        badge: 'Victory',
        title: 'You Won!',
        color: '#4ade80',
        background: 'rgba(74, 222, 128, 0.18)',
        shadow: '0 16px 28px rgba(74, 222, 128, 0.28)',
        defaultMessage: 'You outlasted every challenger. Nicely stacked!',
    },
    lose: {
        badge: 'Defeat',
        title: 'Game Over',
        color: '#f87171',
        background: 'rgba(248, 113, 113, 0.16)',
        shadow: '0 16px 28px rgba(248, 113, 113, 0.28)',
        defaultMessage: 'Another chance awaits. Shake it off and try again.',
    },
    info: {
        badge: 'Game Over',
        title: 'Game Finished',
        color: '#c4b5fd',
        background: 'rgba(196, 181, 253, 0.16)',
        shadow: '0 16px 28px rgba(196, 181, 253, 0.26)',
        defaultMessage: 'The match has ended. Thanks for playing!',
    },
};

const GameResultModal = ({ isOpen, outcome = 'info', onConfirm, isOwner }) => {
    if (!isOpen) {
        return null;
    }

    const variant = VARIANTS[outcome] ?? VARIANTS.info;

    const handleRestart = () => {
        requestRestartGame();
    };

    return (
        <Overlay role='presentation'>
            <Dialog role='dialog' aria-modal='true' aria-labelledby='game-result-title'>
                <OutcomeBadge $variant={variant}>{variant.badge}</OutcomeBadge>
                <Title id='game-result-title'>{variant.title}</Title>
                <Message>{outcome == 'win' ? "you won !" : outcome == 'info' ? variant.defaultMessage : 'you lost !'}</Message>
                {isOwner &&
                    <ActionButton type='button' onClick={handleRestart}>
                        Restart Game
                    </ActionButton>
                }
                <ActionButton type='button' onClick={onConfirm}>
                    Return to Menu
                </ActionButton>
            </Dialog>
        </Overlay>
    );
};

GameResultModal.propTypes = {
    isOpen: PropTypes.bool,
    outcome: PropTypes.oneOf(['win', 'lose', 'info']),
    message: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
};

export default GameResultModal;
