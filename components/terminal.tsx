'use client';

import { useEffect, useRef, useState } from 'react';

const commands: { cmd: string; output: string }[] = [
    { cmd: 'terraform plan -out=tfplan', output: 'Plan: 12 to add, 0 to change, 0 to destroy.' },
    { cmd: 'tfsec ./terraform', output: 'No problems detected!' },
    { cmd: 'uv run pytest -q', output: '47 passed in 2.91s' },
    { cmd: 'helm upgrade --install platform ./charts/platform -n platform', output: 'Release "platform" has been upgraded. Happy Helming!' },
    { cmd: 'ruff check .', output: 'All checks passed!' },
    { cmd: 'trivy image libre-devops/azdo-agent:latest', output: 'Total: 0 (CRITICAL: 0, HIGH: 0)' },
    { cmd: 'claude -p "summarise today\'s commits"', output: 'Refactored auth, bumped deps, fixed 3 flaky tests.' },
    { cmd: 'kubectl get pods --all-namespaces', output: 'platform   api-7d9f8c   1/1   Running   0   2d' },
    { cmd: 'gitleaks detect --source .', output: 'no leaks found' },
    { cmd: 'mypy --strict src/', output: 'Success: no issues found in 31 source files' },
    { cmd: 'az deployment sub create --template-file main.bicep', output: 'Deployment succeeded: ProvisioningState=Succeeded' },
    { cmd: 'semgrep ci', output: 'Findings: 0 (0 blocking)' },
    { cmd: 'ollama run llama3.1 "explain this stack trace"', output: 'Nil pointer: AzureClient was never initialised.' },
    { cmd: 'checkov -d ./terraform --framework terraform', output: 'Passed checks: 142, Failed checks: 0' },
    { cmd: 'cosign verify libre-devops/azdo-agent:latest', output: 'Verified OK: signature is valid.' },
    { cmd: 'docker build -t libre-devops/azdo-agent:latest .', output: 'Successfully built a3f2c1d9e8b7' },
    { cmd: 'go test ./... -v', output: 'ok   github.com/libre-devops/utils   0.312s' },
    { cmd: 'pwsh -c Invoke-AzRestMethod -Path /subscriptions', output: 'StatusCode: 200  Content: { "value": [...] }' },
];

type Phase = 'typing' | 'output' | 'pause';

export function Terminal() {
    const ref = useRef<HTMLDivElement>(null);
    const [cmdIdx, setCmdIdx] = useState(0);
    const [typed, setTyped] = useState('');
    const [showOutput, setShowOutput] = useState(false);
    const [phase, setPhase] = useState<Phase>('typing');
    const [cursorOn, setCursorOn] = useState(true);
    const [animate, setAnimate] = useState(false);   // motion allowed
    const [visible, setVisible] = useState(true);     // intersecting viewport

    // Respect reduced motion: show one static frame instead of animating.
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setTyped(commands[0].cmd);
            setShowOutput(true);
            return;
        }
        setAnimate(true);
    }, []);

    // Pause all work while the terminal is scrolled out of view.
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const running = animate && visible;

    useEffect(() => {
        if (!running) return;
        const t = setInterval(() => setCursorOn((v) => !v), 530);
        return () => clearInterval(t);
    }, [running]);

    useEffect(() => {
        if (!running) return;
        const current = commands[cmdIdx];

        if (phase === 'typing') {
            if (typed.length < current.cmd.length) {
                const t = setTimeout(
                    () => setTyped(current.cmd.slice(0, typed.length + 1)),
                    55 + Math.random() * 35,
                );
                return () => clearTimeout(t);
            }
            const t = setTimeout(() => { setShowOutput(true); setPhase('output'); }, 480);
            return () => clearTimeout(t);
        }

        if (phase === 'output') {
            const t = setTimeout(() => { setShowOutput(false); setPhase('pause'); }, 1800);
            return () => clearTimeout(t);
        }

        if (phase === 'pause') {
            const t = setTimeout(() => {
                setTyped('');
                setCmdIdx((i) => (i + 1) % commands.length);
                setPhase('typing');
            }, 350);
            return () => clearTimeout(t);
        }
    }, [running, phase, typed, cmdIdx]);

    return (
        <div className="hero-terminal" ref={ref}>
            <div className="hero-terminal-bar">
                <div className="hero-terminal-dots">
                    <span className="hero-terminal-dot hero-terminal-dot--red" />
                    <span className="hero-terminal-dot hero-terminal-dot--yellow" />
                    <span className="hero-terminal-dot hero-terminal-dot--green" />
                </div>
                <span className="hero-terminal-title">libre-devops: ~</span>
            </div>
            <div className="hero-terminal-body">
                <div className="hero-terminal-line">
                    <span className="hero-terminal-prompt">$</span>
                    <span className="hero-terminal-cmd">
                        {typed}
                        <span
                            className="hero-terminal-cursor"
                            style={{ opacity: cursorOn ? 1 : 0 }}
                        />
                    </span>
                </div>
                {showOutput && (
                    <div className="hero-terminal-output">
                        {commands[cmdIdx].output}
                    </div>
                )}
            </div>
        </div>
    );
}
