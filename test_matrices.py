import math

protan_machado = [[0.152286, 1.052583, -0.204868],[0.114503, 0.786281, 0.099216],[-0.003882, -0.048116, 1.051998]]
deutan_machado = [[0.367322, 0.860646, -0.227968],[0.280085, 0.672501, 0.047413],[-0.011820, 0.042940, 0.968881]]
tritan_machado = [[1.255528, -0.076749, -0.178779],[-0.078411, 0.930809, 0.147602],[0.004733, 0.691367, 0.303900]]
protan_current = [[0.56667, 0.43333, 0.00000],[0.55833, 0.44167, 0.00000],[0.00000, 0.24167, 0.75833]]
deutan_current = [[0.62500, 0.37500, 0.00000],[0.70000, 0.30000, 0.00000],[0.00000, 0.30000, 0.70000]]
tritan_current = [[0.95000, 0.05000, 0.00000],[0.00000, 0.43333, 0.56667],[0.00000, 0.47500, 0.52500]]

def s2l(c):
    v = c / 255.0
    return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4

def l2s(c):
    c = max(0.0, min(1.0, c))
    v = c * 12.92 if c <= 0.0031308 else 1.055 * (c ** (1.0/2.4)) - 0.055
    return round(max(0, min(255, v * 255)))

def mv(m, v):
    return [sum(m[i][j] * v[j] for j in range(3)) for i in range(3)]

tc = {'Red': (255,0,0), 'Green': (0,255,0), 'Blue': (0,0,255), 'Yellow': (255,255,0)}

print('MACHADO 2009 (correct, from official paper):')
for n, (r, g, b) in tc.items():
    lin = [s2l(r), s2l(g), s2l(b)]
    p = tuple(l2s(x) for x in mv(protan_machado, lin))
    d = tuple(l2s(x) for x in mv(deutan_machado, lin))
    t = tuple(l2s(x) for x in mv(tritan_machado, lin))
    print(f'{n:7s} -> Protan:{p} Deutan:{d} Tritan:{t}')

print()
print('CURRENT APP (Vienot simplified):')
for n, (r, g, b) in tc.items():
    lin = [s2l(r), s2l(g), s2l(b)]
    p = tuple(l2s(x) for x in mv(protan_current, lin))
    d = tuple(l2s(x) for x in mv(deutan_current, lin))
    t = tuple(l2s(x) for x in mv(tritan_current, lin))
    print(f'{n:7s} -> Protan:{p} Deutan:{d} Tritan:{t}')
