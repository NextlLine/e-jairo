export class DocumentMetadata {
    constructor(
        public id: string,
        public unitId: string,
        public name: string,
        public path: string,
        public contentType: string,
        public fileSize: number,
        public category: string | null,
    ) {}
}