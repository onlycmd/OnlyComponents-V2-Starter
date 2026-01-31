const {
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ThumbnailBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags
} = require('discord.js');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Sistem istatistiklerini ve gecikmeyi detaylıca raporlar.'),

    async execute(interaction) {
        // --- VERİ HAZIRLAMA ---
        const wsPing = interaction.client.ws.ping;
        const uptime = process.uptime();
        const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

        // Çalışma süresini formatla (gün-saat-dakika)
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const uptimeString = `${days}g ${hours}s ${minutes}d`;

        const statusColor = wsPing < 100 ? 0x2ecc71 : (wsPing < 200 ? 0xf1c40f : 0xe74c3c);

        // --- GÜVENLİ SEPARATÖR YARDIMCISI ---
        const createSeparator = (isDivider = false) => {
            const sep = new SeparatorBuilder().setDivider(isDivider);
            if (typeof SeparatorSpacingSize !== 'undefined' && SeparatorSpacingSize.Small !== undefined) {
                sep.setSpacing(SeparatorSpacingSize.Small);
            }
            return sep;
        };

        // --- BİLEŞENLER ---

        // 1. Üst Panel: Başlık ve Bot Kimliği
        const header = new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ⚡ ${interaction.client.user.username} Sistem Paneli`),
                new TextDisplayBuilder().setContent(`Anlık ağ performansı ve bot servislerinin durumu aşağıda listelenmiştir.`)
            )
            .setThumbnailAccessory(
                new ThumbnailBuilder({ media: { url: interaction.client.user.displayAvatarURL() } })
            );

        // 2. Performans Kartı (Konteynır)
        const perfCard = new ContainerBuilder()
            .setAccentColor(statusColor)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### ⚡ Performans Verileri`),
                new TextDisplayBuilder().setContent(`> **Gecikme:** \`${wsPing}ms\``),
                new TextDisplayBuilder().setContent(`> **Bellek:** \`${ramUsage} MB\``),
                new TextDisplayBuilder().setContent(`> **Aktif Süre:** \`${uptimeString}\``)
            );

        // 3. Sistem Detay Alanı
        const serverInfo = new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### 🌍 Sunucu Altyapısı`),
                new TextDisplayBuilder().setContent(`> **Platform:** \`${os.platform()} (${os.arch()})\``),
                new TextDisplayBuilder().setContent(`> **Sistem:** \`Components V2 Mimarisi Aktif\``)
            )
            .setThumbnailAccessory(
                new ThumbnailBuilder({ media: { url: 'https://cdn-icons-png.flaticon.com/512/900/900497.png' } })
            );

        // 4. GitHub & Destek Alanı
        const githubSection = new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### ⭐ Destek ve Kaynak Kod`),
                new TextDisplayBuilder().setContent(`Emeğe saygı için GitHub üzerinden **star** ve **fork** atmayı unutmayın!`)
            )
            .setButtonAccessory(
                new ButtonBuilder()
                    .setLabel('GitHub: onlycmd')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://github.com/onlycmd')
            );

        // 5. Alt Bilgi
        const footerText = new TextDisplayBuilder()
            .setContent(`*Sorgulayan: ${interaction.user.globalName || interaction.user.username}* | <t:${Math.floor(Date.now() / 1000)}:R>`);

        // --- YANIT ---
        await interaction.reply({
            components: [
                header,
                createSeparator(true),
                perfCard,
                createSeparator(false),
                serverInfo,
                createSeparator(true),
                githubSection,
                createSeparator(false),
                footerText
            ],
            flags: MessageFlags.IsComponentsV2
        }).catch(err => console.error("Ping Dashboard Hatası:", err));
    }
};