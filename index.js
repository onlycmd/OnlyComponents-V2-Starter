const { Client, GatewayIntentBits, Collection, MessageFlags, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

/**
 * @description Components V2 Mimarisi Üzerine Kurulu Modern Discord Altyapısı
 * @author Antigravity
 */

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// --- KOMUT YÜKLEYİCİ ---
const commandsPath = path.join(__dirname, 'commands');
if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`[KOMUT] ${command.data.name} yüklendi.`);
    }
}

// --- EVENT YÜKLEYİCİ ---
const eventsPath = path.join(__dirname, 'events');
if (!fs.existsSync(eventsPath)) fs.mkdirSync(eventsPath);

const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(`[EVENT] ${event.name} yüklendi.`);
}

// --- ETKİLEŞİM YÖNETİMİ ---
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`[HATA] ${interaction.commandName} çalıştırılırken hata:`, error);

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: '⚠️ Bu komut işlenirken teknik bir sorun oluştu.',
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.reply({
                content: '⚠️ Bu komut işlenirken teknik bir sorun oluştu.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
});

// Hata Yönetimi
process.on('unhandledRejection', error => {
    console.error('Yakalanmayan Söz Reddi:', error);
});

client.login(process.env.TOKEN);
