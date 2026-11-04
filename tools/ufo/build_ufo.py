"""Procedural saucer for the portfolio game.

Same shape language as the pixel sprite that preceded it (components/UFO.jsx):
blue glass dome, silver hull with pressed seams, gunmetal rim with amber
lamps, dark belly with ports, cyan emitter lens, neon antenna. Mothership
fins are a separate object the page toggles.

Ambient occlusion is baked by Cycles into one atlas so the browser gets the
contact shadows for free; everything else (sun, reflections, emission) stays
live because the ship banks and turns.

Run from the repo root:
  blender -b --factory-startup -P tools/ufo/build_ufo.py -- public/models [--preview DIR]
"""
import bpy, bmesh, math, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = os.path.abspath(argv[0] if argv else "public/models")
PREVIEW = argv[argv.index("--preview") + 1] if "--preview" in argv else None
AO_RES = 1024
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return (*[x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c], 1.0)


def mat(name, color, metal=0.0, rough=0.5, emit=None, strength=0.0, alpha=1.0, coat=0.0):
    """Material names are the contract with the page, which restyles by name."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = srgb(color)
    p.inputs["Metallic"].default_value = metal
    p.inputs["Roughness"].default_value = rough
    p.inputs["Coat Weight"].default_value = coat
    if alpha < 1:
        p.inputs["Alpha"].default_value = alpha
    if emit:
        p.inputs["Emission Color"].default_value = srgb(emit)
        p.inputs["Emission Strength"].default_value = strength
    return m


M = {
    "hull":  mat("Hull",  "#d5dade", metal=0.85, rough=0.24, coat=0.4),
    "panel": mat("Panel", "#7e858d", metal=0.8,  rough=0.35),
    "rim":   mat("Rim",   "#4d545c", metal=0.75, rough=0.3),
    "belly": mat("Belly", "#24282e", metal=0.6,  rough=0.45),
    "dome":  mat("Dome",  "#2b9ada", rough=0.04, alpha=0.6, coat=1.0),
    "core":  mat("Core",  "#0e2a44", emit="#7cc8f0", strength=1.2),
    "lamp":  mat("Lamp",  "#e3a83a", emit="#ff9d2e", strength=3.2),
    "lens":  mat("Lens",  "#7cc8f0", emit="#7cc8f0", strength=3.5),
    "neon":  mat("Neon",  "#00e5a0", emit="#00e5a0", strength=3.0),
}

parts, fins = [], []


def add(obj, material, bucket, smooth=True):
    scene.collection.objects.link(obj)
    obj.data.materials.append(material)
    if smooth:
        for poly in obj.data.polygons:
            poly.use_smooth = True
    bucket.append(obj)
    return obj


def from_bm(name, bm):
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return bpy.data.objects.new(name, me)


def lathe(name, profile, material, steps=64):
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0, z)) for r, z in profile]
    edges = [bm.edges.new((verts[i], verts[i + 1])) for i in range(len(verts) - 1)]
    bmesh.ops.spin(bm, geom=verts + edges, cent=(0, 0, 0), axis=(0, 0, 1),
                   angle=math.tau, steps=steps, use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    return add(from_bm(name, bm), material, parts)


def sphere(name, r, loc, material, scale=(1, 1, 1), segs=32, rings=16, half=False, bucket=None):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=rings, radius=r)
    if half:
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -1e-4], context="VERTS")
    for v in bm.verts:
        v.co = Vector((v.co.x * scale[0], v.co.y * scale[1], v.co.z * scale[2])) + Vector(loc)
    return add(from_bm(name, bm), material, parts if bucket is None else bucket)


def torus(name, R, r, z, material, maj=64, mn=8):
    bm = bmesh.new()
    ring = [[bm.verts.new(((R + r * math.cos(b)) * math.cos(a), (R + r * math.cos(b)) * math.sin(a),
                           z + r * math.sin(b)))
             for b in (math.tau * j / mn for j in range(mn))]
            for a in (math.tau * i / maj for i in range(maj))]
    for i in range(maj):
        for j in range(mn):
            a, b = ring[i], ring[(i + 1) % maj]
            bm.faces.new((a[j], b[j], b[(j + 1) % mn], a[(j + 1) % mn]))
    return add(from_bm(name, bm), material, parts)


# ── hull, rim and belly ─────────────────────────────────────────────────
DOME_R, DOME_Z = 0.40, 0.215
lathe("HullTop", [(DOME_R + 0.02, DOME_Z), (0.47, 0.21), (0.6, 0.175),
                  (0.75, 0.115), (0.88, 0.06), (0.96, 0.028)], M["hull"])
lathe("Rim", [(0.96, 0.028), (0.995, 0.018), (1.005, 0.0), (1.0, -0.03), (0.965, -0.048)], M["rim"])
lathe("Belly", [(0.965, -0.048), (0.86, -0.085), (0.7, -0.125), (0.52, -0.16),
                (0.36, -0.185), (0.30, -0.19), (0.28, -0.205)], M["belly"])
torus("GrooveA", 0.66, 0.006, 0.152, M["panel"])
torus("GrooveB", 0.86, 0.005, 0.069, M["panel"])
torus("Collar", DOME_R + 0.015, 0.022, DOME_Z + 0.004, M["rim"])

# ── dome ────────────────────────────────────────────────────────────────
sphere("Dome", DOME_R, (0, 0, DOME_Z), M["dome"], scale=(1, 1, 0.78), half=True)
sphere("DomeCore", DOME_R * 0.55, (0, 0, DOME_Z), M["core"], scale=(1, 1, 0.7), half=True)

# ── emitter ─────────────────────────────────────────────────────────────
torus("LensRing", 0.24, 0.025, -0.205, M["rim"])
sphere("Lens", 0.22, (0, 0, -0.205), M["lens"], scale=(1, 1, -0.32), half=True)

# ── lamps ───────────────────────────────────────────────────────────────
for i in range(16):
    a = math.tau * i / 16
    sphere(f"RimLamp{i:02d}", 0.03, (math.cos(a), math.sin(a), -0.006), M["lamp"], segs=12, rings=6)
for i in range(8):
    a = math.tau * (i + 0.5) / 8
    sphere(f"BellyLamp{i}", 0.03, (math.cos(a) * 0.6, math.sin(a) * 0.6, -0.15), M["lens"],
           scale=(1, 1, 0.5), segs=12, rings=6)

# ── antenna ─────────────────────────────────────────────────────────────
top = DOME_Z + DOME_R * 0.78
bm = bmesh.new()
bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=0.012, radius2=0.012, depth=0.16)
for v in bm.verts:
    v.co.z += top + 0.07
add(from_bm("Antenna", bm), M["rim"], parts)
sphere("Beacon", 0.045, (0, 0, top + 0.17), M["neon"], segs=20, rings=10)

# ── mothership fins: four swept blades on the rim, lamp at each tip ─────
for k in range(4):
    a = math.tau * (k + 0.5) / 4
    bm = bmesh.new()
    # blade profile in (radial, z): root on the rim, tip swept out and down
    prof = [(0.9, 0.05), (1.32, -0.02), (1.38, -0.09), (0.92, -0.06)]
    t = 0.028
    vs = [[bm.verts.new((r, s * t * (1.4 - (r - 0.9)), z)) for r, z in prof] for s in (-1, 1)]
    bm.faces.new(vs[0][::-1]); bm.faces.new(vs[1])
    for i in range(4):
        j = (i + 1) % 4
        bm.faces.new((vs[0][i], vs[0][j], vs[1][j], vs[1][i]))
    for v in bm.verts:
        x, y = v.co.x, v.co.y
        v.co.x, v.co.y = x * math.cos(a) - y * math.sin(a), x * math.sin(a) + y * math.cos(a)
    add(from_bm(f"Fin{k}", bm), M["rim"], fins, smooth=False)
    sphere(f"FinLamp{k}", 0.035, (math.cos(a) * 1.36, math.sin(a) * 1.36, -0.06), M["lamp"],
           segs=12, rings=6, bucket=fins)


def join(objs, name):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    o = bpy.context.active_object
    o.name = o.data.name = name
    return o


saucer = join(parts, "Saucer")
finobj = join(fins, "Fins")

# ── one UV atlas for both, then bake AO into it ─────────────────────────
bpy.ops.object.select_all(action="DESELECT")
for o in (saucer, finobj):
    o.select_set(True)
bpy.context.view_layer.objects.active = saucer
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.004)
bpy.ops.uv.average_islands_scale()
bpy.ops.uv.pack_islands(margin=0.004)
bpy.ops.object.mode_set(mode="OBJECT")

scene.render.engine = "CYCLES"
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "CUDA"   # OptiX does not start under WSL
    prefs.get_devices()
    for d in prefs.devices:
        d.use = d.type == "CUDA"
    if any(d.use for d in prefs.devices):
        scene.cycles.device = "GPU"
except Exception as e:
    print("CPU bake:", e)
scene.cycles.samples = 256
world = bpy.data.worlds.new("World")
scene.world = world
world.light_settings.distance = 0.35

ao = bpy.data.images.new("ufo-ao", AO_RES, AO_RES, alpha=False, float_buffer=False)
for m in M.values():
    n = m.node_tree.nodes.new("ShaderNodeTexImage")
    n.image = ao
    m.node_tree.nodes.active = n
scene.render.bake.margin = 8
scene.render.bake.margin_type = "EXTEND"
bpy.ops.object.bake(type="AO")
# baked at 1024 for clean edges, shipped at 512: the ship is ~100 px on screen
ao.scale(AO_RES // 2, AO_RES // 2)
ao.filepath_raw = os.path.join(OUT, "ufo-ao.jpg")
ao.file_format = "JPEG"
scene.render.image_settings.file_format = "JPEG"
scene.render.image_settings.color_mode = "BW"
scene.render.image_settings.quality = 88
ao.save_render(ao.filepath_raw, scene=scene)
# the bake target nodes must not leak into the glTF as base colour
for m in M.values():
    for n in [n for n in m.node_tree.nodes if n.type == "TEX_IMAGE"]:
        m.node_tree.nodes.remove(n)

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "..", "..", "tools", "ufo", "ufo.blend"))
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, "ufo.glb"), export_format="GLB",
                          export_apply=True, export_yup=True, export_texcoords=True,
                          export_normals=True, export_materials="EXPORT")
print("done")

if not PREVIEW:
    sys.exit(0)

# ── preview: AO-only clay render, side and top, to check the bake ───────
os.makedirs(PREVIEW, exist_ok=True)
for m in M.values():
    nt = m.node_tree
    n = nt.nodes.new("ShaderNodeTexImage")
    n.image = ao
    p = nt.nodes["Principled BSDF"]
    nt.links.new(n.outputs["Color"], p.inputs["Base Color"])
    p.inputs["Metallic"].default_value = 0
    p.inputs["Roughness"].default_value = 0.8
    p.inputs["Alpha"].default_value = 1
world.color = (0.8, 0.8, 0.8)
cam = bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam"))
scene.collection.objects.link(cam)
scene.camera = cam
cam.data.lens = 60
scene.cycles.samples = 32
scene.render.resolution_x, scene.render.resolution_y = 900, 600
for fname, loc in (("ao_side.png", (2.6, -3.6, 1.2)), ("ao_top.png", (0.01, -1.2, 4.6))):
    cam.location = loc
    cam.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = os.path.join(PREVIEW, fname)
    bpy.ops.render.render(write_still=True)
