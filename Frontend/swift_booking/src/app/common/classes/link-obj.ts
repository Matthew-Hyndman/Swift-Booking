export class LinkObj {
    /**     
     * @param name - name of nav link item
     * @param path - path of nav link item
     * @param enable - show or hide link item
     */
    constructor(
        public label: string,
        public path: string,
        public enabled: boolean = true
    ) {}
}
