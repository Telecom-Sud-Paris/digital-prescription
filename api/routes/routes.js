app.post('/api/prescriptions/register', async (req, res) => {
    try {

        res.status(201).json({
            message: '',
            data: JSON.parse(result.toString())
        });
    } catch (error) {
        console.error(` ${error}`);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/prescriptions/dispense', async (req, res) => {
    try {

        res.status(201).json({
            message: '',
            data: JSON.parse(result.toString())
        });
    } catch (error) {
        console.error(` ${error}`);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/revocation-registry/register', async (req, res) => {
    try {

        res.status(201).json({
            message: '',
            data: JSON.parse(result.toString())
        });
    } catch (error) {
        console.error(` ${error}`);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/revocation-registry/revoke', async (req, res) => {
    try {

        res.status(201).json({
            message: '',
            data: JSON.parse(result.toString())
        });
    } catch (error) {
        console.error(` ${error}`);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/trust-registry/register', async (req, res) => {
    try {

        res.status(201).json({
            message: '',
            data: JSON.parse(result.toString())
        });
    } catch (error) {
        console.error(` ${error}`);
        res.status(500).json({ error: error.message });
    }
});

