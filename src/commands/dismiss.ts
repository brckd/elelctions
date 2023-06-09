import { EmbedBuilder } from "@discordjs/builders";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { Colors } from "discord.js";
import { PermissionsBitField } from "discord.js";
import Candidate from "../schemata/candidate";

@ApplyOptions<Command.Options>({
  description: "Dismiss a candidate from the current election.",
  requiredUserPermissions: ["Administrator"],
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((builder) =>
          builder
            .setName("election")
            .setDescription("The selection to dismiss from.")
            .setAutocomplete(true)
            .setRequired(true)
        )
        .addUserOption((builder) =>
          builder.setName("candidate").setDescription("Candidate to dismiss").setRequired(true)
        )
        .setDefaultMemberPermissions(
          new PermissionsBitField(this.options.requiredUserPermissions).valueOf()
        )
    );
  }

  public override async chatInputRun(inter: Command.ChatInputCommandInteraction) {
    const { guildId } = inter;
    const election = inter.options.getString("election");
    const candidate = inter.options.getUser("candidate");

    await Candidate.deleteOne({ guildId, election, candidateId: candidate?.id });

    const embed = new EmbedBuilder()
      .setDescription(`${candidate} has successfully been dismissed from **${election}**!`)
      .setColor(Colors.Green);
    return inter.reply({ embeds: [embed], ephemeral: true });
  }
}
