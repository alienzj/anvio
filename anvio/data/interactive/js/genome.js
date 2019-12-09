
function Gene(props) {
    this.viewer = props.viewer;
    this.start = props.start;
    this.stop = props.stop;
    this.direction = props.direction;
    this.gene_callers_id = props.gene_callers_id;
}

Gene.prototype.draw = function(context, offsetY, offsetX) {

    let ctx = this.viewer.context;
    let start = this.viewer.centerPos + (offsetX + this.start - this.viewer.centerPosBase) * this.viewer.xscale;
    let width = (this.stop - this.start) * this.viewer.xscale;
    let triangleWidth = (width >= 10) ? 10 : width;

    ctx.fillRect(this.viewer.centerPos-2,0,4,20);
    ctx.beginPath();
    if (this.gene_callers_id == '1338') {
        ctx.fillStyle = "#000";    
    }
    else {
        ctx.fillStyle = "#F9A520";    
    }
    

    if (this.direction == 'f') {
        ctx.moveTo(start + width - triangleWidth, offsetY);
        ctx.lineTo(start + width, offsetY + 8);
        ctx.lineTo(start + width - triangleWidth, offsetY + 16);
    }
    else
    {
        ctx.moveTo(start + triangleWidth, offsetY);
        ctx.lineTo(start, offsetY + 8);
        ctx.lineTo(start + triangleWidth, offsetY + 16);   
    }
    
    if (width - triangleWidth > 0) {
        if (this.direction == 'f')
        {
            ctx.rect(start, offsetY + 3, width - triangleWidth, 10);
        }
        else 
        {
            ctx.rect(start + triangleWidth, offsetY + 3, width - triangleWidth, 10);
        }
    }
    ctx.fill();
}

function GenomeViewer(options) {
    let defaults = {
        'canvas': '',
    }
    this.options = $.extend(defaults, options);
    this.canvas = this.options.canvas;
    this.context = this.canvas.getContext('2d');
    this.width = 0;
    this.height = 0;

    this.trackNames = {};
    this.tracks = [];

    this.canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
    this.canvas.addEventListener('mousedown', (event) => this.handleMouseDown(event));
    this.canvas.addEventListener('mouseup', (event) => this.handleMouseUp(event));
    this.canvas.addEventListener('wheel', (event) => this.handleWheel(event));
    window.addEventListener('resize', (event) => this.handleResize(event));

    this.mouseDown = false;
    this.panStart = {'x': 0, 'y': 0};

    this.windowSize = 10000;
    this.centerPos = 0;
    this.centerPosBase = 0;
    this.xscale = 0.1;
}

GenomeViewer.prototype.getTrack = function(name) {
    let index = -1;
    if (this.trackNames.hasOwnProperty(name)) {
        index = this.trackNames[name];
        return this.tracks[index];
    } else {
        index = this.tracks.length;
        this.tracks.push(new GenomeTrack(this));
        this.trackNames[name] = index;
    }
    return this.tracks[index];
}

GenomeViewer.prototype.handleMouseMove = function(event) {
    if (this.mouseDown) {
        this.centerPos = event.x - this.panStart.x;
        this.draw();
    }
}

GenomeViewer.prototype.handleMouseDown = function(event) {
    let matrix = this.context.getTransform();
    this.panStart = {'x': event.x - this.centerPos, 'y': 0 };
    this.mouseDown = true;
}

GenomeViewer.prototype.handleMouseUp = function(event) {
    this.mouseDown = false;
}


GenomeViewer.prototype.handleResize = function(event) {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.draw();
}

GenomeViewer.prototype.handleWheel = function(event) {
    if (event && event.deltaY < 0) {
        //this.xscale -= 0.0003;
        this.xscale = this.xscale * 0.98;
    } else {
        //this.xscale += 0.0003;
        this.xscale = this.xscale * 1.02;
    }
    this.draw();
}


GenomeViewer.prototype.center = function(target) {
    this.centerPos = this.width / 2;
    this.draw();
}

GenomeViewer.prototype.clear = function() {
    let ctx = this.context;
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0, this.width, this.height);
    ctx.restore();
}

GenomeViewer.prototype.draw = function() {
    this.clear();

    this.tracks.forEach((track, order) => { 
        track.draw(this.context, 22 + order * 22); 
    });
}

function GenomeTrack(viewer) {
    this.viewer = viewer;
    this.contigs = [];
}


GenomeTrack.prototype.draw = function(context, offset) {
    this.contigs.forEach((contig) => { 
        contig.draw(context, offset); 
    });
}

function Contig(viewer) {
    this.viewer = viewer;
    this.name = null;
    this.length = 0;
    this.offsetX = 0;
    this.genes = [];
}

Contig.prototype.getGene = function(gene_callers_id) {
    let gene = this.genes.find((gene) => {
        return (gene.gene_callers_id == gene_callers_id);
    });
    return gene;
}

Contig.prototype.draw = function(context, offsetY) {
    context.beginPath();
    context.fillStyle = "#DEDEDE";
    context.rect(this.viewer.centerPos + (this.offsetX - this.viewer.centerPosBase) * this.viewer.xscale,
                    offsetY + 3, 
                    this.length * this.viewer.xscale, 
                    10);
    context.fill();

    this.genes.forEach((gene) => { 
        gene.draw(context, offsetY, this.offsetX);
    });
}