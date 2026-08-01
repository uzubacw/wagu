const path = require("path");
const fs = require("fs-extra");

const config = require("./config");
const { Grupo, Nescessario, Muted, Banned, Take } = require("./database");
const { loadGroupData, loadGlobalData, loadMuted } = require("./handlers/dataLoader");
const { startConnection } = require("./core/connection");
const { handleCommand, suggestCommand } = require("./commands/dispatcher");
const {
handleAntiStatus,
handleAntiPayment,
handleAntiNotas,
handleAntiPrivate,
handleMute,
handleAntiSpam,
handleAntiPalavrao,
} = require("./handlers/antiSpam");
const {
httpAgent,
httpsAgent,
apiCache,
CACHE_TTL,
cacheGet,
cacheSet,
cacheKey,
cacheStats,
cacheFlush,
cachedFetchJson,
cachedFetchText,
cachedGetBuffer,
} = require("../arquivos/funcoes/httpAgent.js");
const { lidParaJid, sincronizarGrupo } = require("../arquivos/funcoes/mapeamento.js");
const { handleAntiLinkHard, handleAntiLinkEasy } = require("./handlers/antiLink");
const { handleAntiMedia } = require("./handlers/antiMedia");
const { handleAutoDown } = require("./handlers/autoDown");
const { handleAutoSticker, handleAutoStickerFfmpeg } = require("./handlers/autoSticker");
const { handleWelcome } = require("./handlers/welcome");
const {
extractBody,
extractQuotedBody,
buildMediaFlags,
buildQuotedFlags,
buildQuotedContext,
detectMessageType,
getBaileys,
getContentType,
} = require("./handlers/messageUtils");
const {
isUrl,
similarityCmd,
mess,
getGroupAdmins,
extractDDD,
extractStateFromDDD,
extractStateFromNumber,
getName,
sleep,
readJSON,
extractDomain,
registrarNumeroSuspeito,
jaProcessou,
marcarComoProcessado,
DLT_FL,
} = require("./utils/helpers");
const { fundolevel, fundo2, fundo1, linklogos, imgnazista, imggay, imgcorno, imggostosa, imggostoso, imgfeio, imggado, imgvesgo, imgbebado, tapacmd, matarcmd, beijocmd, chutecmd, deathcmd, rnkgay, rnkgado, rnkcorno, rnkgostoso, rnkgostosa,
rnknazista, rnkotaku, rnkpau, suruba, minado_bomb, thumbnail, imgsigma, imgbeta, imgbaiano, imgbaiana, imgcarioca, imglouco, imglouca, imgsafada, imgsafado, imgmacaco, imgmacaca, imgputa, rnksigma, rnkbeta, rnkbaiano, rnkbaiana,
rnkcarioca, rnklouco, rnklouca, rnksafada, rnksafado, rnkmacaco, rnkmacaca, rnkputa, rnkfiel, rnkinfiel } = require("../settings/links_img.json");
const { handleEval, handleSimi, handlePrefixoEcho } = require("./handlers/specials");
const { waguriLogger } = require("./utils/logger");
const linguagem = require("../settings/imports/menus");

const { prefix, botName, ownerName, ownerNumber, apiUrl, apiKey } = config;

const commandsDir = path.join(__dirname, "commands");
require("./commands/registry").loadFromDirectory(commandsDir);

const arrayDDDs = [11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33,
34, 35, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55,
61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82,
83, 84, 85, 86, 87, 88, 89, 91, 93, 94, 95, 96, 97, 98, 99];

function normalizeJid(groupId, jid) {
if (!jid) return "";
if (jid.includes("@lid")) return lidParaJid(groupId, jid);
if (jid.includes("@s.whatsapp.net")) return jid;
if (jid.includes("@g.us")) return jid;
if (jid.includes("@broadcast")) return jid;
return `${jid}@s.whatsapp.net`;
}

async function processMessages(upsert, waguri) {
for (const info of upsert?.messages || []) {
if (!info.message) continue;

try {
const baileys = await getBaileys();

const from = info.key.remoteJid;
const isGroup = from?.endsWith("@g.us");
const groupMetadata = isGroup ? await waguri.groupMetadata(from).catch(() => null) : null;
const groupName = groupMetadata?.subject || "";
let grupo = isGroup ? await Grupo.findOne({ groupId: from }) : null;
if (isGroup && !grupo) {
grupo = await Grupo.create({ groupId: from, name: groupName });
} else if (isGroup && grupo && grupo.name !== groupName) {
grupo.name = groupName;
await Grupo.updateOne({ groupId: from }, { $set: { name: groupName } });
}

const isStatus = from?.endsWith("@broadcast");

const pkgPath = require.resolve("ourin-baileys/package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const baileysVersion = pkg.version;

const type = getContentType(info.message);
if (type === "protocolMessage" || type === "reactionMessage" || type === "senderKeyDistributionMessage") continue;
const content = JSON.stringify(info.message);
const pushname = info.pushName || "";
const blacklist = (await Banned.findOne({})) || { numeros: {} };
const nescessario = await Nescessario.findOne({}) || await Nescessario.create({});
const muted = await Muted.find({});

const { visualizarmsg, emojimenu } = nescessario;

if (visualizarmsg) {
await waguri.readMessages([info.key]);
} else {
if (from === "status@broadcast") return;
}

const { extractBody: extBody, extractQuotedBody: extQuotedBody, buildMediaFlags: bmf, buildQuotedFlags: bqf } = require("./handlers/messageUtils");

const body = extBody(info);
const Procurar_String = body || extQuotedBody(info);

const args = body.trim().split(/ +/).slice(1);
const budy2 = body.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const isCmd = body.trim().startsWith(prefix);
const command = isCmd ? budy2.trim().slice(1).split(/ +/).shift().toLocaleLowerCase() : null;
const q = args.join(" ");
const query = args.join(" ");
const budy = type === "conversation" ? info.message?.conversation : type === "extendedTextMessage" ? info.message?.extendedTextMessage?.text : "";
const budy3 = budy.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const PR_String = Procurar_String.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const groupMembers = isGroup ? groupMetadata?.participants || [] : [];
const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : [];
const somembros = isGroup ? groupMembers.map(m => m.id) : [];

if (isGroup && groupMembers.length > 0) {
sincronizarGrupo(from, groupMembers);
}

const rawBotNumber = waguri.user?.id?.split(":")[0] || "";
const botNumber = rawBotNumber.includes("@") ? rawBotNumber : rawBotNumber + "@s.whatsapp.net";
const rawSender = info.key.participantAlt || info.key.remoteJidAlt || info.key.remoteJid || "";
const sender = isGroup ? normalizeJid(from, rawSender) : rawSender;

const numerodn = ownerNumber.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
const SoDono = sender.includes(numerodn);
const isBotGroupAdmins = groupAdmins.includes(botNumber) || false;
const isGroupAdmins = groupAdmins.includes(sender) || false || SoDono;
const isCargo = SoDono ? "MESTRE" : isGroupAdmins ? "ADMIN" : "MEMBRO";

const isAntiSpam = isGroup ? grupo?.antispam?.active : false;
const tempoAntiSpam = isGroup ? grupo?.antispam?.tempo : 5;
const isAntiImg = isGroup ? grupo?.antiimg : false;
const isAntiVid = isGroup ? grupo?.antivideo : false;
const isAntiAudio = isGroup ? grupo?.antiaudio : false;
const isAntiSticker = isGroup ? grupo?.antisticker : false;
const Antidoc = isGroup ? grupo?.antidoc : false;
const isAntiCtt = isGroup ? grupo?.antictt : false;
const Antiloc = isGroup ? grupo?.antiloc : false;
const isAntiDDD = isGroup ? grupo?.ANTI_DDD?.active : false;
const isAntilinkgp = isGroup ? grupo?.antilinkgp : false;
const isAntiLinkHard = isGroup ? grupo?.antilinkhard : false;
const isAntiLinkEasy = isGroup ? grupo?.antilinkeasy : false;
const isAntiNotas = isGroup ? grupo?.antinotas : false;
const isAntiStatus = isGroup ? grupo?.antistatus : false;
const isPayment = isGroup ? grupo?.antipagamento : false;
const isAnticatalogo = isGroup ? grupo?.anticatalogo : false;
const isWelkom = isGroup ? grupo?.wellcome?.[0]?.bemvindo1 : false;
const isSimi = isGroup ? grupo?.simi1 : false;
const isAutofigu = isGroup ? grupo?.autosticker?.isAutofigu : false;
const IsAutofigu = isGroup ? grupo?.autosticker?.IsAutofigu : false;
const autofigu = isGroup ? grupo?.autosticker?.autofigu : false;
const isAutorepo = isGroup ? grupo?.autoresposta : false;
const isModobn = isGroup ? grupo?.jogos : false;
const isModo18 = isGroup ? grupo?.porno : false;
const isAutodown = isGroup ? grupo?.autodown : false;
const isBanchat = isGroup ? grupo?.bangp : false;
const isPalavrao = isGroup ? (grupo?.antipalavrao?.palavras?.length > 0) : false;
const isAntiFlood = isGroup ? grupo?.anti_flood : false;
const isAntiPv = nescessario?.antipv || false;
const isAnticall = nescessario?.anticall || false;
const isAntifake = isGroup ? grupo?.antifake : false;
const IS_DELETE = nescessario?.Odelete || true;
const So_Adm = isGroup ? grupo?.soadm : false;
const isMultiP = isGroup ? grupo?.multiprefix : false;
const isVisualizar = nescessario?.visualizarmsg;
const isVerificado = nescessario?.verificado;

const quoted = info.message?.extendedTextMessage?.contextInfo;
const isBot = sender.includes(waguri.user?.id);
const dono = sender.includes(numerodn);

const { isImage, isVideo, isAudio, isSticker, isContact, isLocation, isProduct, isMedia, typeMessage } = bmf(type);
const quotedFlags = bqf(type, content);

const mentionedJidArray = quoted?.mentionedJid || [];
const rawMenc = mentionedJidArray[0] || (quoted?.participant || "");
const menc_os2 = isGroup ? normalizeJid(from, rawMenc) : rawMenc;
const menc_jid2 = isGroup ? normalizeJid(from, menc_os2) : menc_os2;

function reply(texto) { return waguri.sendMessage(from, { text: texto }, { quoted: info }); }
function reagir(jid, emoji) { return waguri.sendMessage(jid, { react: { text: emoji, key: info.key } }); }
function mention(texto, jids = [menc_os2 || sender]) {
return waguri.sendMessage(from, { text: texto, mentions: jids }, { quoted: info });
}

const quotedContact = {id: "selin", key: {participant : '0@s.whatsapp.net'},message: {contactMessage: {displayName: `${pushname}`}}};

if(!isVerificado) {
var selo = quotedContact;
} else {
var selo = info;
};

const ctx = {
...require("./utils/helpers"),
waguri, info, type, content, from, sender, pushname, isGroup, grupo: [grupo], dataGp: [grupo],
groupMetadata, groupName, groupMembers, groupAdmins, somembros, botNumber,
isBotGroupAdmins, isGroupAdmins, SoDono, So_Adm, isCargo,
numerodn, nescessario, setNes: async (index) => {
await Nescessario.updateOne({ _id: nescessario._id }, { $set: index });
}, setGp: async (gpArray) => {
const gp = gpArray[0];
if (gp && gp._id) await Grupo.updateOne({ _id: gp._id }, { $set: gp });
},
body, budy, budy2, budy3, args, q, query, PR_String, Procurar_String, isCmd, command, prefix, baileysVersion, selo,
totalcmds: require("./commands/registry").getAll().length,
isBot, dono, blackist: blacklist, IS_DELETE, isVisualizar, isVerificado, emojimenu, muted, logos: config.logos,
isAntiImg, isAntiVid, isAntiAudio, isAntiSticker, Antidoc, isAntiCtt, Antiloc,
isAntiDDD, isAntilinkgp, isAntiLinkHard, isAntiLinkEasy, isAntiNotas, isAntiStatus,
isPayment, isAnticatalogo, isWelkom, isSimi, isAutofigu, IsAutofigu, autofigu,
isAutorepo, isModobn, isModo18, isAutodown, isBanchat, isPalavrao, isAntiFlood,
isAntiPv, isAnticall, isAntifake, isAntiSpam, tempoAntiSpam, isImage, isVideo, isAudio, isSticker, isContact,
isLocation, isProduct, isMedia, typeMessage, ...quotedFlags, arrayDDDs,
reply, reagir, mention, mess, IMG_LINKS: config.getAll(), RANK_LINKS: config.getAll(), CMD_LINKS: config.getAll(),
API_WAGURI: apiUrl, KEY_WAGURI: apiKey, NomeDoBot: botName, ownerName, ownerNumber,
setting: config, linguagem,
fundolevel, fundo2, fundo1, linklogos, imgnazista, imggay, imgcorno, imggostosa, imggostoso, imgfeio, imggado, imgvesgo, imgbebado, tapacmd, matarcmd, beijocmd, chutecmd, deathcmd, rnkgay, rnkgado, rnkcorno, rnkgostoso, rnkgostosa,
rnknazista, rnkotaku, rnkpau, suruba, minado_bomb, thumbnail, imgsigma, imgbeta, imgbaiano, imgbaiana, imgcarioca, imglouco, imglouca, imgsafada, imgsafado, imgmacaco, imgmacaca, imgputa, rnksigma, rnkbeta, rnkbaiano, rnkbaiana,
rnkcarioca, rnklouco, rnklouca, rnksafada, rnksafado, rnkmacaco, rnkmacaca, rnkputa, rnkfiel, rnkinfiel,
httpAgent, httpsAgent, apiCache, CACHE_TTL, cacheGet, cacheSet, cacheKey,
cacheStats, cacheFlush, cachedFetchJson, cachedFetchText, cachedGetBuffer,
menc_os2, menc_jid2, mention, mentionedJid: mentionedJidArray,
upload: require("../arquivos/funcoes/functions.js").upload,
fetchJson: require("../arquivos/funcoes/functions.js").fetchJson,
sendImageAsSticker2: require("../arquivos/stickers/rename2.js").sendImageAsSticker2,
sendVideoAsSticker2: require("../arquivos/stickers/rename2.js").sendVideoAsSticker2,
sendImageAsSticker: require("../arquivos/stickers/rename.js").sendImageAsSticker,
sendVideoAsSticker: require("../arquivos/stickers/rename.js").sendVideoAsSticker,
downloadMediaMessage: async (msg, type) => (await getBaileys()).downloadMediaMessage(msg, type),
};

if (!info.key.fromMe && type !== "reactionMessage" && type !== "senderKeyDistributionMessage" && type !== "protocolMessage") {
waguriLogger.messageLog({ type: typeMessage, pushname, sender, from, command: isCmd ? command : null, isCmd, isGroup, groupName });
}

await handleAntiStatus(ctx);
await handleAntiPayment(ctx);
await handleAntiNotas(ctx);
if (await handleAntiSpam(ctx)) return;

if (isBanchat && !SoDono) {
await waguri.sendMessage(from, { text: "🚫 *Grupo banido!* Este grupo não tem permissão para usar o bot." }, { quoted: info });
return;
}

if (isAntiImg && isImage) await handleAntiMedia(ctx);
else if (isAntiSticker && isSticker) await handleAntiMedia(ctx);
else if (Antidoc && type === "documentMessage") await handleAntiMedia(ctx);
else if (isAntiVid && isVideo) await handleAntiMedia(ctx);
else if (isAntiAudio && isAudio) await handleAntiMedia(ctx);
else if ((isAntiCtt || Antiloc || isAnticatalogo) && (isContact || isLocation || isProduct)) await handleAntiMedia(ctx);

if (isAntiLinkHard && isUrl(PR_String)) await handleAntiLinkHard(ctx);
else if (isAntiLinkEasy && isUrl(PR_String)) await handleAntiLinkEasy(ctx);

if (isAutodown) { if (await handleAutoDown(ctx)) return; }

if (isAntiPv && !isGroup && !SoDono) { await handleAntiPrivate(ctx); return; }
if (await handleMute(ctx)) return;
await handleAntiPalavrao(ctx);

if (So_Adm && !isGroupAdmins && isCmd) {
reply(mess.onlyAdmins());
return;
}

if (isCmd) {
if (await handleCommand(ctx)) return;
suggestCommand(command, prefix, require("./commands/registry").commands, similarityCmd, reagir, from, waguri, info);
return;
}

if (isAutofigu) { setTimeout(() => handleAutoSticker(ctx).catch(() => {}), 1000); }
if (IsAutofigu) { setTimeout(() => handleAutoStickerFfmpeg(ctx).catch(() => {}), 1000); }

await handleEval(ctx);
await handleSimi(ctx);
await handlePrefixoEcho(ctx);

} catch (e) {
console.error("[PROCESS ERROR]", e);
}
}
}

async function starthana() {
const baileys = await import("ourin-baileys");

startConnection({
baileys,
onGroupParticipants: async (waguri, event) => {
try {
await handleWelcome({ waguri, event,
Grupo, mess, NomeDoBot: botName, fundo1: config.getLinks("fundo1"), API_WAGURI: apiUrl, KEY_WAGURI: apiKey,
time: require("../arquivos/funcoes/functions.js").time, setting: config, getGroupAdmins,
extractDDD, extractStateFromDDD, extractStateFromNumber, getName });
} catch (e) { console.log(e); }
},
onMessage: async (waguri, upsert) => {
await processMessages(upsert, waguri);
}
});
}

starthana();

fs.watchFile(require.resolve(__filename), () => {
console.log(require("chalk").yellow("[ SISTEMA ] Arquivo alterado, reiniciando waguri.."));
setTimeout(() => { process.exit(); }, 500);
});