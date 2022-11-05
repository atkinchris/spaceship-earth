
/* vect: vector expressed in a cartesian basis */
struct vect {
	double x, y, z;
};

struct vect scale(struct vect v, double l);
struct vect normal(struct vect points[]);
struct vect midpoint(struct vect p1, struct vect p2);
