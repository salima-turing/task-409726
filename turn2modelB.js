
async function simulateAccessControl() {
    const scenarios = {
        "No Auth": async () => await noAuth(),
        "Basic Auth": async () => await basicAuth(),
        "OAuth": async () => await oAuth(),
        "Custom Token": async () => await customTokenValidation(),
    };

    for (const [label, func] of Object.entries(scenarios)) {
        const start = performance.now();
        let result;
        try {
            result = await func();
        } catch (error) {
            console.error(`Error in ${label}: ${error.message}`);
            if (error instanceof AuthTimeoutError) {
                // Fallback to a less secure authentication method if the primary fails
                result = `Access granted via fallback for ${label} due to timeout`;
            } else {
                throw error;
            }
        }
        const end = performance.now();
        console.log(`${label} execution time: ${(end - start).toFixed(2)} ms | Result: ${result}`);
    }
}

class AuthTimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthTimeoutError';
    }
}

async function noAuth() {
    return "Access granted without authentication.";
}

async function basicAuth() {
    const minDelay = 50;
    const maxDelay = 150;
    const delayTime = Math.random() * (maxDelay - minDelay) + minDelay;
    await simulateDelay('Basic Auth', delayTime);
    return "Access granted with Basic Authentication.";
}

async function oAuth() {
    const retryAttempts = 2;
    const minDelay = 100;
    const maxDelay = 300;

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
        try {
            const delayTime = Math.random() * (maxDelay - minDelay) + minDelay;
            await simulateDelay('OAuth', delayTime);
            return "Access granted with OAuth.";
        } catch (error) {
            if (attempt === retryAttempts) {
                throw error;
            }
            console.error(`OAuth failed, retrying attempt ${attempt + 1}/${retryAttempts + 1}`);
            await delay(500); // Simulate a retry delay
        }
    }
}

async function customTokenValidation() {
    const minDelay = 150;
    const maxDelay = 250;
    const delayTime = Math.random() * (maxDelay - minDelay) + minDelay;
    await simulateDelay('Custom Token', delayTime);
    return "Access granted with Custom Token Validation.";
}

async function simulateDelay(name, delayTime) {
    const timeout = Math.random() * 1000 + 500; // Simulate random timeout between 500ms and 1500ms
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.1) {
                // Simulate server load failure 10% of the time
                reject(new Error(`${name} server is under high load`));
            } else {
                setTimeout(resolve, delayTime);
            }
        }, timeout);
    });
}

async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Execute the simulation
simulateAccessControl();
