import math

class Vector3:
    """A simple 3D vector class to represent positions and directions."""
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

    def __add__(self, other):
        return Vector3(self.x + other.x, self.y + other.y, self.z + other.z)

    def __mul__(self, scalar):
        return Vector3(self.x * scalar, self.y * scalar, self.z * scalar)

    def __repr__(self):
        return f"({self.x:.2f}, {self.y:.2f}, {self.z:.2f})"

class Bullet:
    """Represents a bullet in 3D space."""
    def __init__(self, position, direction, speed):
        self.position = position
        self.direction = direction
        self.speed = speed

    def update(self):
        """Update the bullet's position based on its direction and speed."""
        self.position += self.direction * self.speed

    def __repr__(self):
        return f"Bullet at {self.position}"

class Gun:
    """A simple 3D gun that shoots bullets."""
    def __init__(self, position):
        self.position = position
        self.bullets = []

    def shoot(self, target):
        """Shoot a bullet towards a target."""
        direction = Vector3(target.x - self.position.x,
                            target.y - self.position.y,
                            target.z - self.position.z)
        distance = math.sqrt(direction.x**2 + direction.y**2 + direction.z**2)
        direction = Vector3(direction.x / distance,
                            direction.y / distance,
                            direction.z / distance)  # Normalize direction
        bullet = Bullet(self.position, direction, speed=1.0)
        self.bullets.append(bullet)
        print(f"Shot fired towards {target}!")

    def update(self):
        """Update all bullets' positions."""
        for bullet in self.bullets:
            bullet.update()
            print(bullet)

# Main program
if __name__ == "__main__":
    gun = Gun(position=Vector3(0, 0, 0))  # Gun at the origin
    target = Vector3(10, 5, 2)  # Target position

    gun.shoot(target)  # Shoot towards the target

    # Simulate bullet movement for 10 steps
    for step in range(10):
        print(f"\nStep {step + 1}:")
        gun.update()
