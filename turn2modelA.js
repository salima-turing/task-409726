async function simulateAccessControl() {
    const scenarios = {
        "No Auth": () => noAuth(),
        "Basic Auth": () => basicAuth(),
        "OAuth": () => oauth(),
        "Custom Token": () => customTokenValidation(),
    };

    for (const [label, func] of Object.entries(scenarios)) {
        try {
            const result = await measureExecutionTime(func);
            console.log(`${label}: ${result}`);
        } catch (error) {
            console.error(`${label} failed: ${error.message}`);
        }
    }
}

async function measureExecutionTime(func) {
    const start = performance.now();
    const result = await func();
    const end = performance.now();
    return `Execution time: ${(end - start).toFixed(2)} ms | Result: ${result}`;
}

async function noAuth() {
    // Simulating processing time for no auth
    await simulateDelay();
    return "Access granted without authentication.";
}

async function basicAuth() {
    return await performAuthWithRetry(() => simulateDelay(100, 200), "Basic Authentication");
}

async function oauth() {
    return await performAuthWithRetry(() => simulateDelay(200, 400), "OAuth");
}

async function customTokenValidation() {
    return await performAuthWithRetry(() => simulateDelay(150, 300), "Custom Token Validation");
}

async function performAuthWithRetry(authFunction, authType, retries = 3, timeout = 500) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const abortController = new AbortController();
            const signal = abortController.signal;

            const timeoutId = setTimeout(() => abortController.abort(), timeout);

            const result = await Promise.race([
                authFunction(),
                new Promise((_, reject) => signal.addEventListener("abort", () => reject(new Error(`${authType} timed out`))))
            ]);

            clearTimeout(timeoutId);
            return `Access granted with ${authType}.`;
        } catch (error) {
            if (attempt === retries) {
                throw new Error(`${authType} failed after ${retries} attempts: ${error.message}`);
            }
            console.warn(`Attempt ${attempt} for ${authType} failed: ${error.message}. Retrying...`);
        }
    }
}

async function simulateDelay(minDelay, maxDelay) {
    // Simulate random network latency based on real-world factors
    const delayTime = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    await new Promise(resolve => setTimeout(resolve, delayTime));
}

// Execute the simulation
simulateAccessControl();
