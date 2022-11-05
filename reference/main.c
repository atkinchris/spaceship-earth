/*
	RB_SE_STL_Generator
	main.c

	author:		Richard Bachmann
	created:	2021-11-07
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

#define PHI ((1.0 + sqrt(5.0)) / 2.0)	/* golden ratio */
#define PEAK 1.025

void init_dodecahedron(struct vect a[12][5]);
void subdiv_pentagon(struct vect p[]);
void subdiv_triangle(struct vect t[], int numtimes);
void peak_triangle(struct vect tri[]);
void print_triangle(struct vect t[]);

int main()
{
	int i;
	struct vect dodecahedron[12][5];

	printf("solid spaceship_earth\n");
	printf("\n");

	init_dodecahedron(dodecahedron);

	for (i = 0; i < 12; i++)
		subdiv_pentagon(dodecahedron[i]);

	printf("endsolid spaceship_earth\n");

	return 0;
}

/* init_dodecahedron: initializes given polygon array with points for a
	dodecahedron of circumscribed radius 1; assumes given array is of size
	[12][5] */
void init_dodecahedron(struct vect dd[12][5])
{
	int i, j;
	struct vect a1, a2, a3, a4, a5, a6, a7, a8;
	struct vect b1, b2, b3, b4;
	struct vect c1, c2, c3, c4;
	struct vect d1, d2, d3, d4;

	/* define vertices of regular dodecahedron; radius of circumscribed sphere
		is currently sqrt(3) */

	/* "a" vertices; forms a cube */
	a1.x = 1;	a1.y = 1;	a1.z = 1;
	a2.x = 1;	a2.y = 1;	a2.z = -1;
	a3.x = 1;	a3.y = -1;	a3.z = 1;
	a4.x = 1;	a4.y = -1;	a4.z = -1;
	a5.x = -1;	a5.y = 1;	a5.z = 1;
	a6.x = -1;	a6.y = 1;	a6.z = -1;
	a7.x = -1;	a7.y = -1;	a7.z = 1;
	a8.x = -1;	a8.y = -1;	a8.z = -1;

	/* "b" vertices; forms a rectangle on the yz-plane */
	b1.x = 0;	b1.y = PHI;		b1.z = 1.0 / PHI;
	b2.x = 0;	b2.y = PHI;		b2.z = -1.0 / PHI;
	b3.x = 0;	b3.y = -PHI;	b3.z = 1.0 / PHI;
	b4.x = 0;	b4.y = -PHI;	b4.z = -1.0 / PHI;

	/* "c" vertices; forms a rectangle on the xz-plane */
	c1.x = 1.0 / PHI;	c1.y = 0;	c1.z = PHI;
	c2.x = 1.0 / PHI;	c2.y = 0;	c2.z = -PHI;
	c3.x = -1.0 / PHI;	c3.y = 0;	c3.z = PHI;
	c4.x = -1.0 / PHI;	c4.y = 0;	c4.z = -PHI;

	/* "d" vertices; forms a rectangle on the xy-plane */
	d1.x = PHI;		d1.y = 1.0 / PHI;	d1.z = 0;
	d2.x = PHI;		d2.y = -1.0 / PHI;	d2.z = 0;
	d3.x = -PHI;	d3.y = 1.0 / PHI;	d3.z = 0;
	d4.x = -PHI;	d4.y = -1.0 / PHI;	d4.z = 0;


	struct vect dodecahedron[12][5] = {
		{ b1, a1, d1, a2, b2 },
		{ b2, a6, d3, a5, b1 },
		{ b3, a7, d4, a8, b4 },
		{ b4, a4, d2, a3, b3 },
		{ c1, a1, b1, a5, c3 },
		{ c2, a4, b4, a8, c4 },
		{ c3, a7, b3, a3, c1 },
		{ c4, a6, b2, a2, c2 },
		{ d1, a1, c1, a3, d2 },
		{ d2, a4, c2, a2, d1 },
		{ d3, a6, c4, a8, d4 },
		{ d4, a7, c3, a5, d3 }
	};

	/* copy dodecahedron to given array pointer; scale to radius of 1.0 */
	for (i = 0; i < 12; i++)
		for (j = 0; j < 5; j++)
			dd[i][j] = scale(dodecahedron[i][j], 1.0);
}

/* subdiv_pentagon: divides given spherical pentagon into spherical
	triangles; calls subdiv_triangle() */
void subdiv_pentagon(struct vect p[])
{
	int i;
	struct vect n;

	n = normal(p);

	struct vect triangles[5][3] = {
		{n, p[0], p[1]},
		{n, p[1], p[2]},
		{n, p[2], p[3]},
		{n, p[3], p[4]},
		{n, p[4], p[0]}
	};

	for (i = 0; i < 5; i++)
		subdiv_triangle(triangles[i], 3);
}

/* subdiv_triangle: subdivides given triangle into 4 triangles, recursively by
	numtimes; passes generated triangles to peak_triangle() */
void subdiv_triangle(struct vect t[], int numtimes)
{
	int i;

	if (numtimes <= 0) {
		peak_triangle(t);
		return;
	}

	struct vect m[3] = {
		scale(midpoint(t[0], t[1]), 1.0),
		scale(midpoint(t[1], t[2]), 1.0),
		scale(midpoint(t[2], t[0]), 1.0),
	};

	struct vect newtriangles[4][3] = {
		{ t[0], m[0], m[2] },
		{ t[1], m[1], m[0] },
		{ t[2], m[2], m[1] },
		{ m[0], m[1], m[2] },
	};

	for (i = 0; i < 4; i++)
		subdiv_triangle(newtriangles[i], numtimes - 1);
}

/* peak_triangle: converts given triangle into pyramid-like peaks consisting of
	3 triangles; passes generated triangles to print_triangle() */
void peak_triangle(struct vect tri[])
{
	int i;
	struct vect n;

	n = scale(normal(tri), PEAK);

	struct vect triangles[3][3] = {
		{n, tri[0], tri[1]},
		{n, tri[1], tri[2]},
		{n, tri[2], tri[0]}
	};

	for (i = 0; i < 3; i++)
		print_triangle(triangles[i]);
}

/* print_triangle: prints given triangle in STL format to stdout */
void print_triangle(struct vect t[])
{
	struct vect n = normal(t);

	printf("facet normal %f %f %f\n", n.x, n.y, n.z);

	printf("\touter loop\n");
	printf("\t\tvertex %f %f %f\n", t[0].x, t[0].y, t[0].z);
	printf("\t\tvertex %f %f %f\n", t[1].x, t[1].y, t[1].z);
	printf("\t\tvertex %f %f %f\n", t[2].x, t[2].y, t[2].z);
	printf("\tendloop\n");

	printf("endfacet\n");
	printf("\n");
}
