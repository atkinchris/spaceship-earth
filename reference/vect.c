/*
	RB_SE_STL_Generator
	vect.c

	author:		Richard Bachmann
	created:	2021-11-10
	updated:	2021-12-05

    RB_SE_STL_Generator generates a 3D model of a Spaceship Earth-style
    geodesic sphere in the ASCII STL format.
    Copyright (C) 2021 Richard Bachmann

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

#include <stdio.h>
#include <math.h>
#include "vect.h"

/* scale: returns position vector with direction of v and magnitude
	of l */
struct vect scale(struct vect v, double l)
{
	double vl;
	struct vect nv;

	vl = sqrt(pow(v.x, 2) + pow(v.y, 2) + pow(v.z, 2));

	nv.x = (v.x / vl) * l;
	nv.y = (v.y / vl) * l;
	nv.z = (v.z / vl) * l;

	return nv;
}

/* normal: returns a unit vector normal to the plane containing points[];
	points[] must contain 3 or more position vectors (if more, only the first
	3 will be used); to get a normal vector that points "outwards", points[]
	must be arranged in counter-clockwise order from outside */
struct vect normal(struct vect points[])
{
	struct vect a, b, n;

	a.x = points[1].x - points[0].x;
	a.y = points[1].y - points[0].y;
	a.z = points[1].z - points[0].z;

	b.x = points[2].x - points[0].x;
	b.y = points[2].y - points[0].y;
	b.z = points[2].z - points[0].z;

    /* calculate cross product of a and b; n = a X b */
	n.x = (a.y * b.z) - (a.z * b.y);
	n.y = (a.z * b.x) - (a.x * b.z);
	n.z = (a.x * b.y) - (a.y * b.x);

	return scale(n, 1.0);
}

/* midpoint: returns the position vector of the midpoint of the two given
	position vectors */
struct vect midpoint(struct vect p1, struct vect p2)
{
	struct vect m;

	m.x = (p1.x + p2.x) / 2.0;
	m.y = (p1.y + p2.y) / 2.0;
	m.z = (p1.z + p2.z) / 2.0;

	return m;
}
