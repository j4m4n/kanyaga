function applySpeedLimit(vx, vy, speedLimit) {
    const hyp = Math.hypot(vx, vy);
    if (hyp === 0) return { vx: 0, vy: 0 };
    const maxSpeed = Math.min(hyp, speedLimit);
    const ratio = maxSpeed / hyp;
    return {
        vx: ratio * vx,
        vy: ratio * vy,
    };
}