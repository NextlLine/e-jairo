export class Document {
    constructor(
        public id: string,
        public name: string,
        public contentType: string,
        public size: number,
        public data: Buffer
    ) { }
}