export class Clock {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d');
    window.requestAnimationFrame(() => this.draw());
  }

  draw() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, 150, 150);
    this.ctx.translate(75, 75);
    this.ctx.scale(0.4, 0.4);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.strokeStyle = 'white';
    this.ctx.fillStyle = 'black';
    this.ctx.lineWidth = 8;
    this.ctx.lineCap = 'round';

    // Hour marks
    this.ctx.save();
    for (let i = 0; i < 12; i++) {
      this.ctx.beginPath();
      this.ctx.rotate(Math.PI / 6);
      this.ctx.moveTo(100, 0);
      this.ctx.lineTo(120, 0);
      this.ctx.stroke();
    }
    this.ctx.restore();

    // Minute marks
    this.ctx.save();
    this.ctx.lineWidth = 5;
    for (let i = 0; i < 60; i++) {
      if (i % 5 !== 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(117, 0);
        this.ctx.lineTo(120, 0);
        this.ctx.stroke();
      }
      this.ctx.rotate(Math.PI / 30);
    }
    this.ctx.restore();

    const now = new Date();
    const sec = now.getSeconds();
    const min = now.getMinutes();
    let hr = now.getHours();
    hr = hr >= 12 ? hr - 12 : hr;

    this.ctx.fillStyle = 'black';

    // write Hours
    this.ctx.save();
    this.ctx.rotate(
      hr * (Math.PI / 6) + (Math.PI / 360) * min + (Math.PI / 21600) * sec
    );
    this.ctx.lineWidth = 14;
    this.ctx.beginPath();
    this.ctx.moveTo(-20, 0);
    this.ctx.lineTo(80, 0);
    this.ctx.stroke();
    this.ctx.restore();

    // write Minutes
    this.ctx.save();
    this.ctx.rotate((Math.PI / 30) * min + (Math.PI / 1800) * sec);
    this.ctx.lineWidth = 10;
    this.ctx.beginPath();
    this.ctx.moveTo(-28, 0);
    this.ctx.lineTo(112, 0);
    this.ctx.stroke();
    this.ctx.restore();

    // Write seconds
    this.ctx.save();
    this.ctx.rotate((sec * Math.PI) / 30);
    this.ctx.strokeStyle = '#3086d3';
    this.ctx.fillStyle = '#3086d3';
    this.ctx.lineWidth = 6;
    this.ctx.beginPath();
    this.ctx.moveTo(-30, 0);
    this.ctx.lineTo(83, 0);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 10, 0, Math.PI * 2, true);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(95, 0, 10, 0, Math.PI * 2, true);
    this.ctx.stroke();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    this.ctx.arc(0, 0, 3, 0, Math.PI * 2, true);
    this.ctx.fill();
    this.ctx.restore();

    this.ctx.beginPath();
    this.ctx.lineWidth = 7;
    this.ctx.strokeStyle = 'white';
    this.ctx.arc(0, 0, 130, 0, Math.PI * 2, true);
    this.ctx.stroke();

    this.ctx.restore();

    window.requestAnimationFrame(() => this.draw());
  }
}
