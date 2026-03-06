// server/plugins/fabric-init.ts
export default defineNitroPlugin(async (nitroApp) => {
    console.log('Nitro Plugin: Initializing Fabric...');
    await initFabricConnection();
});