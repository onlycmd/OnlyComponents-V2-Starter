const { Events, ActivityType, REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`-------------------------------------------`);
        console.log(`Bot Hazır! Giriş Yapılan: ${client.user.tag}`);
        console.log(`Components V2 Modu: Aktif ✅`);
        console.log(`-------------------------------------------`);

        // --- OTOMATİK SLASH KOMUT YÜKLEYİCİ ---
        const commands = [];
        const commandsPath = path.join(__dirname, '../commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            }
        }

        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

        try {
            console.log(`[OTOMATİK] ${commands.length} komut kaydediliyor...`);

            if (process.env.GUILD_ID) {
                // GUILD_ID varsa sunucuya yükle (Anında yansır)
                await rest.put(
                    Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
                    { body: commands },
                );
                console.log(`[OTOMATİK] Komutlar SUNUCU bazlı kaydedildi (ID: ${process.env.GUILD_ID}).`);
            } else {
                // Yoksa global yükle
                await rest.put(
                    Routes.applicationCommands(client.user.id),
                    { body: commands },
                );
                console.log(`[OTOMATİK] Komutlar GLOBAL bazlı kaydedildi.`);
            }
        } catch (error) {
            console.error('[OTOMATİK HATA]', error);
        }

        // Oynuyor / Yayın Yapıyor Kısmı
        client.user.setActivity({
            name: 'Dc v14 bot | onlycmd',
            type: ActivityType.Streaming,
            url: 'https://twitch.tv/discordv14'
        });
    },
};
