// آیکون و اطلاعات نسخه را داخل exe می‌نشاند (بدون wine؛ electron-builder روی لینوکس بدون wine این کار را نمی‌کند)
const fs = require("node:fs");
const path = require("node:path");
const ResEdit = require("resedit");

exports.default = async function afterPack(ctx) {
  if (ctx.electronPlatformName !== "win32") return;
  const exe = path.join(ctx.appOutDir, `${ctx.packager.appInfo.productFilename}.exe`);
  const pe = ResEdit.NtExecutable.from(fs.readFileSync(exe));
  const res = ResEdit.NtExecutableResource.from(pe);

  const icon = ResEdit.Data.IconFile.from(fs.readFileSync(path.join(__dirname, "icon.ico")));
  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
    res.entries, 1, 1033, icon.icons.map((i) => i.data),
  );

  const [vi] = ResEdit.Resource.VersionInfo.fromEntries(res.entries);
  const v = ctx.packager.appInfo.version.split(".").map(Number);
  vi.setFileVersion(v[0] || 0, v[1] || 0, v[2] || 0, 0, 1033);
  vi.setProductVersion(v[0] || 0, v[1] || 0, v[2] || 0, 0, 1033);
  vi.setStringValues({ lang: 1033, codepage: 1200 }, { FileDescription: "Shemiran Gold", ProductName: "Shemiran Gold", CompanyName: "Shemiran Gold", OriginalFilename: "Shemiran Gold.exe" });
  vi.outputToResourceEntries(res.entries);

  res.outputResource(pe);
  fs.writeFileSync(exe, Buffer.from(pe.generate()));
};
