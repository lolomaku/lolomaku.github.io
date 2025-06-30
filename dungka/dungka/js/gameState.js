/**
 * Central state management for the game.
 * All dynamic game variables are stored here to avoid polluting the global scope
 * and to make state tracking and debugging easier.
 */
export const gameState = {
    // Player and Score State
    username: "",
    score: 0,
    scoreSubmitted: false,
    lastScoreSubmissionTime: 0,
    gameStartTime: 0,

    // Game Loop State
    timeLeft: 60,
    gameActive: false,
    timerInterval: 1000,
    countdownTimer: null,

    // Power-up and Enemy Spawning State
    powerActive: false,
    powerSpawningStarted: false,
    powerSpawnRate: 1000,
    lastPowerTime: 0,
    lastPowerInteractionTime: 0,
    powerUsageLog: { shown: {}, activated: {} },

    // Active Power-up Flags
    isGentoActive: false,
    isTimerPauseActive: false,
    isWmianActive: false,
    isSftsActive: false,
    isCrimzoneActive: false,
    eightTonActive: false,
    wyatActive: false,
    whatActive: false,
    ballCanBounce: true,

    // Interval/Timeout Tracking
    sftsSpawnInterval: null,
    activePowerAudios: [],
    activeTimeouts: [],
    activeIntervals: [],
};