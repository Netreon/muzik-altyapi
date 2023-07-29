const { SlashCommandBuilder, ChannelType, EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('müzik')
		.setDescription('Exp Müzik')
        .addSubcommand(subcommand => 
            subcommand.setName("oynat")
            .setDescription("Müzik Oynatırsınız")
            .addStringOption(option => 
                option.setName("müzik")
                    .setDescription("Müzik Belirtiniz")
                    .setRequired(true))
        )
        .addSubcommand(subcommand => 
            subcommand.setName("ses")
            .setDescription("Müzik Ses Ayarlarını Yönetirsiniz")
            .addIntegerOption(option => 
                option.setName("düzey")
                    .setDescription("1den 100e kadar sesi belirtiniz")
                    .setMinValue(1)
                    .setMaxValue(100)
                    .setRequired(true))
        )
        .addSubcommand(subcommand => 
            subcommand.setName("ayarlar")
            .setDescription("Müzik Ayarları")
            .addStringOption(option => 
                option.setName("ayarlar")
                    .setDescription("Müzik Ayarları")
                    .setRequired(true)
                    .addChoices(
                        {name: "sıra", value: "sıra"},
                        {name: "geç", value: "geç"},
                        {name: "durdur", value: "durdur"},
                        {name: "devam", value: "devam"},
                        {name: "bitir", value: "bitir"},
                    ))
        ),
	async execute(client, interaction) {
        const { options, member, guild, channel } = interaction

        const subcommand = options.getSubcommand()
        const music = options.getString("müzik")
        const volume = options.getInteger("düzey")
        const option = options.getString("ayarlar")
        const voiceChannel = member.voice.channel

        const embed = new EmbedBuilder()

        if (!voiceChannel) {
            embed.setTitle("Hata")
            embed.setDescription("Lütfen bir ses kanalına katılınız.")
            embed.setThumbnail(interaction.guild.iconURL())
            embed.setColor(Colors.Red)
            return interaction.reply({ embeds: [embed] }).catch(() => {return})
        }

        if (!member.voice.channelId == guild.members.me.voice.channelId) {
            embed.setTitle("Hata")
            embed.setDescription(`Müzik zaten <#${guild.members.me.voice.channelId}> kanalında çalıyor!`)
            embed.setThumbnail(interaction.guild.iconURL())
            embed.setColor(Colors.Red)
            return interaction.reply({ embeds: [embed] }).catch(() => {return})
        }

        try {
            switch (subcommand) {
                case "oynat":
                    embed.setTitle("Lütfen Bekleyiniz")
                    embed.setDescription(`Müzik oynatma isteğiniz alındı. Bu işlem biraz zaman alabilir.`)
                    embed.setThumbnail(interaction.guild.iconURL())
                    embed.setColor(Colors.Blue)
                    return interaction.reply({ embeds: [embed] }).then(async (thenmsg) => {
                        await client.DisTube.play(voiceChannel, music, { textChannel: channel, member: member }).catch(() => {return})
                        embed.setTitle("Müzik Oynatılıyor")
                        embed.setDescription(`İstediğiniz müzik sıraya eklendi!`)
                        embed.setThumbnail(interaction.guild.iconURL())
                        embed.setColor(Colors.Green)
                        return thenmsg.edit({ embeds: [embed] }).catch(() => {return})
                    }).catch(() => {return})
                case "ses":
                    if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                        embed.setTitle("Hata")
                        embed.setDescription(`Gerekli yetkiye sahip değilsin.`)
                        embed.setThumbnail(interaction.guild.iconURL())
                        embed.setColor(Colors.Red)
                        return interaction.reply({ embeds: [embed] }).catch(() => {return})
                    }
                    await client.DisTube.setVolume(voiceChannel, volume)
                    embed.setTitle("Ses Düzeyi Değiştirildi")
                    embed.setDescription(`Müzik ses değişimi isteğiniz onaylandı. Müzik ses düzeyi %${volume} olarak değiştirildi.`)
                    embed.setThumbnail(interaction.guild.iconURL())
                    embed.setColor(Colors.Green)
                    return interaction.reply({ embeds: [embed] }).catch(() => {return})
                case "ayarlar":
                    if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                        embed.setTitle("Hata")
                        embed.setDescription(`Gerekli yetkiye sahip değilsin.`)
                        embed.setThumbnail(interaction.guild.iconURL())
                        embed.setColor(Colors.Red)
                        return interaction.reply({ embeds: [embed] }).catch(() => {return})
                    }
                    const queue = await client.DisTube.getQueue(voiceChannel);

                    if (!queue) {
                        embed.setTitle("Hata")
                        embed.setDescription(`Aktif müzik bulunamadı.`)
                        embed.setThumbnail(interaction.guild.iconURL())
                        embed.setColor(Colors.Red)
                        return interaction.reply({ embeds: [embed] }).catch(() => {return})
                    }

                    switch (option) {
                        case "geç":
                            await queue.skip(voiceChannel);
                            embed.setTitle("Müzik Geçildi")
                            embed.setDescription(`Başarıyla oynatma listesindeki diğer bir müziğe geçiş yaptınız.`)
                            embed.setThumbnail(interaction.guild.iconURL())
                            embed.setColor(Colors.Green)
                            return interaction.reply({ embeds: [embed] }).catch(() => {return})
                        case "bitir":
                            await queue.stop(voiceChannel);
                            embed.setTitle("Liste Sıfırlandı")
                            embed.setDescription(`Tüm müzikler bitirildi.`)
                            embed.setThumbnail(interaction.guild.iconURL())
                            embed.setColor(Colors.Green)
                            return interaction.reply({ embeds: [embed] }).catch(() => {return})
                        case "durdur":
                            await queue.pause(voiceChannel);
                            embed.setTitle("Müzik Durduruldu")
                            embed.setDescription(`Başarıyla oynatma listesindeki aktif müziği durdurdunuz.`)
                            embed.setThumbnail(interaction.guild.iconURL())
                            embed.setColor(Colors.Green)
                            return interaction.reply({ embeds: [embed] }).catch(() => {return})
                        case "devam":
                            await queue.resume(voiceChannel);
                            embed.setTitle("Müzik Devam Ediyor")
                            embed.setDescription(`Başarıyla oynatma listesindeki durdurulmuş müziği aktifleştirdiniz.`)
                            embed.setThumbnail(interaction.guild.iconURL())
                            embed.setColor(Colors.Green)
                            return interaction.reply({ embeds: [embed] }).catch(() => {return})
                        case "sıra":
                            embed.setTitle("Müzik Sırası")
                            embed.setDescription(`${queue.songs.map(
                                (song, id) => `\n**${id + 1}.** ${song.name} - \`${song.formattedDuration}\``
                            )}`)
                            embed.setThumbnail(interaction.guild.iconURL())
                            embed.setColor(Colors.Blue)
                            return interaction.reply({ embeds: [embed] }).catch(() => {return})
                    }
            }
        } catch(error) {
            embed.setTitle("Bir Sorun Oluştu")
            embed.setDescription(`Lütfen daha sonra tekrar dene.`)
            embed.setThumbnail(interaction.guild.iconURL())
            embed.setColor(Colors.Red)
            return interaction.reply({ embeds: [embed] }).catch(() => {return})
        }
	},
};